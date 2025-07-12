// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Segurança contra reentrância e pagamentos
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/security/PullPayment.sol";
// Chainlink VRF para aleatoriedade
import "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

/**
 * @title Bittery
 * @notice Sistema de salas de sorteio/loteria, com salas fixas e sorteio global semanal.
 * - Owner (definido pelo VRFConsumerBaseV2Plus) cria salas (backend/cron)
 * - Jogadores compram tickets, com taxa e referral
 * - Sorteio ocorre ao atingir limite de jogadores ou por chamada manual (sala global)
 * - Pagamentos (prêmio, reembolso) via PullPayment: usuário saca
 * - Suporte futuro para ERC20/MATIC/POLYGON com `paymentToken`
 */
contract Bittery is VRFConsumerBaseV2Plus, ReentrancyGuard, Pausable, PullPayment {
    struct Room {
        uint256 id;
        uint256 ticketPrice;           // Preço do ticket (em wei)
        uint256 maxPlayers;            // 0 = sala global (sem limite)
        address[] players;             // Lista de jogadores
        bool drawing;                  // Sorteio em andamento?
        address winner;                // Ganhador, se já sorteado
        uint256 createdAt;             // Timestamp de criação (para expiração)
        bool expired;                  // Se a sala expirou por tempo
        bool refunded;                 // Se já foi reembolsada
        address paymentToken;          // 0x0 = nativo, outro = ERC20 (futuro)
    }

    // Parâmetros de taxa
    uint256 public feePercent = 5;           // % da taxa (ex: 5%)
    uint256 public referralPercent = 50;     // % da taxa que vai para referral (ex: 50%)
    address public feeRecipient;             // Endereço que recebe a taxa

    // Configuração do Chainlink VRF
    uint256 private immutable subscriptionId;
    bytes32 private immutable keyHash;
    uint32 private constant CALLBACK_GAS_LIMIT = 100000;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;

    // Parâmetro de expiração
    uint256 public constant ROOM_EXPIRY = 7 days; // Salas expiram em 7 dias

    // Rooms
    uint256 public nextRoomId;
    mapping(uint256 => Room) public rooms;
    mapping(uint256 => uint256) public requestToRoomId;
    address[] public globalWinners;

    // Eventos
    event RoomCreated(uint256 indexed roomId, uint256 price, uint256 maxPlayers, address paymentToken);
    event TicketBought(uint256 indexed roomId, address indexed player, address referrer);
    event WinnerPicked(uint256 indexed roomId, address indexed winner);
    event RoomExpired(uint256 indexed roomId);
    event RoomRefunded(uint256 indexed roomId);
    event Withdraw(address indexed to, uint256 amount);

    // OnlyOwner: do VRFConsumerBaseV2Plus
    modifier onlyOwner() {
        require(msg.sender == owner(), "Caller is not the owner");
        _;
    }

    // Owner herdado do VRFConsumerBaseV2Plus
    function owner() public view returns (address) {
        return VRFConsumerBaseV2Plus.owner();
    }

    // --------------------------------------------
    //              CONSTRUTOR
    // --------------------------------------------

    /**
     * @param _coordinator: Endereço do Chainlink VRF Coordinator
     * @param _subscriptionId: ID da subscription VRF
     * @param _keyHash: keyHash da VRF
     * @param _feeRecipient: Endereço da wallet de taxas
     */
    constructor(
        address _coordinator,
        uint256 _subscriptionId,
        bytes32 _keyHash,
        address _feeRecipient
    ) VRFConsumerBaseV2Plus(_coordinator) {
        subscriptionId = _subscriptionId;
        keyHash = _keyHash;
        feeRecipient = _feeRecipient;
        nextRoomId = 0;
    }

    // --------------------------------------------
    //          CRIAÇÃO DE SALAS (ADMIN)
    // --------------------------------------------

    /**
     * @notice Owner/backend cria nova sala.
     * @param ticketPrice: valor do ticket (em wei)
     * @param maxPlayers: 0 = sala global (sem limite, manual draw)
     * @param paymentToken: 0x0 = nativo (ETH/MATIC); outro = ERC20 (futuro)
     */
    function createRoom(uint256 ticketPrice, uint256 maxPlayers, address paymentToken) external {
        require(msg.sender == owner(), "Only owner");
        require(ticketPrice > 0, "Invalid price");
        require(maxPlayers == 0 || maxPlayers >= 2, "Min 2 players or 0 for global");

        Room storage newRoom = rooms[nextRoomId];
        newRoom.id = nextRoomId;
        newRoom.ticketPrice = ticketPrice;
        newRoom.maxPlayers = maxPlayers;
        newRoom.paymentToken = paymentToken;
        newRoom.createdAt = block.timestamp;

        emit RoomCreated(nextRoomId, ticketPrice, maxPlayers, paymentToken);
        nextRoomId++;
    }

    // --------------------------------------------
    //             COMPRA DE TICKET
    // --------------------------------------------

    /**
     * @notice Jogador compra ticket (só nativo, ETH/MATIC)
     * @param roomId: índice da sala
     * @param referrer: endereço do referral (opcional, não pode ser self)
     */
    function buyTicket(uint256 roomId, address referrer) external payable nonReentrant whenNotPaused {
        Room storage room = rooms[roomId];
        require(room.ticketPrice > 0, "Room does not exist");
        require(room.paymentToken == address(0), "ERC20 not supported yet");
        require(!room.drawing, "Draw in progress");
        require(!room.expired, "Room expired");
        require(!room.refunded, "Room already refunded");
        require(
            room.maxPlayers == 0 || room.players.length < room.maxPlayers,
            "Room full"
        );
        require(msg.value == room.ticketPrice, "Incorrect ETH sent");
        require(referrer != msg.sender, "Cannot refer yourself");

        // Se a sala expirou por tempo, bloqueia entrada
        if (room.maxPlayers > 0 && block.timestamp > room.createdAt + ROOM_EXPIRY) {
            room.expired = true;
            emit RoomExpired(roomId);
            revert("Room expired");
        }

        // Calcula taxa e bonus referral
        uint256 feeAmount = (msg.value * feePercent) / 100;
        uint256 referralBonus = 0;

        // Envia bônus para referral se existir (ignora falha)
        if (referrer != address(0)) {
            referralBonus = (feeAmount * referralPercent) / 100;
            (bool referralSent, ) = payable(referrer).call{value: referralBonus}("");
            // Não faz require aqui, só ignora se falhar
        }

        // Envia fee para recipient
        uint256 remainingFee = feeAmount - referralBonus;
        if (remainingFee > 0) {
            (bool feeSent, ) = payable(feeRecipient).call{value: remainingFee}("");
            require(feeSent, "Fee transfer failed");
        }

        room.players.push(msg.sender);
        emit TicketBought(roomId, msg.sender, referrer);

        // Se não for sala global, sorteia ao atingir o máximo
        if (room.maxPlayers > 0 && room.players.length == room.maxPlayers) {
            _requestRandomWinner(roomId);
        }
    }

    // --------------------------------------------
    //          SORTEIO GLOBAL (ADMIN/CRON)
    // --------------------------------------------

    /**
     * @notice Owner/cron dispara sorteio em salas globais (sem limite)
     */
    function triggerGlobalDraw(uint256 roomId) external {
        Room storage room = rooms[roomId];
        require(msg.sender == owner(), "Only owner/cron");
        require(room.maxPlayers == 0, "Not a global room");
        require(!room.drawing, "Draw in progress");
        require(room.players.length > 1, "Not enough players");
        _requestRandomWinner(roomId);
    }

    // --------------------------------------------
    //       SORTEIO CHAINLINK VRF (INTERNO)
    // --------------------------------------------

    function _requestRandomWinner(uint256 roomId) internal {
        Room storage room = rooms[roomId];
        require(!room.drawing, "Already drawing");
        require(room.players.length > 1, "Not enough players");
        room.drawing = true;

        uint256 requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: keyHash,
                subId: subscriptionId,
                requestConfirmations: REQUEST_CONFIRMATIONS,
                callbackGasLimit: CALLBACK_GAS_LIMIT,
                numWords: 1,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({
                        nativePayment: false
                    })
                )
            })
        );
        requestToRoomId[requestId] = roomId;
    }

    /**
     * @notice Recebe o número randômico, escolhe ganhador e registra. Paga via PullPayment.
     */
    function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) internal override {
        require(msg.sender == address(s_vrfCoordinator), "Only VRF Coordinator");

        uint256 roomId = requestToRoomId[requestId];
        Room storage room = rooms[roomId];
        require(room.drawing, "Not drawing");

        // Escolhe ganhador
        uint256 index = randomWords[0] % room.players.length;
        address winner = room.players[index];
        room.winner = winner;
        room.drawing = false;

        // Calcula prêmio (total - fee)
        uint256 pot = room.ticketPrice * room.players.length;
        uint256 payout = pot * (100 - feePercent) / 100;

        // Usando PullPayment: o usuário saca o prêmio quando quiser
        _asyncTransfer(winner, payout);

        globalWinners.push(winner);
        emit WinnerPicked(roomId, winner);
    }

    // --------------------------------------------
    //      REEMBOLSO DE SALA EXPIRADA (ADMIN)
    // --------------------------------------------

    /**
     * @notice Owner/cron reembolsa sala expirada. Devolve ticket - fee para cada player.
     */
    function refundExpiredRoom(uint256 roomId) external onlyOwner nonReentrant {
        Room storage room = rooms[roomId];
        require(room.maxPlayers > 0, "Not a standard room");
        require(!room.refunded, "Already refunded");
        require(room.expired || block.timestamp > room.createdAt + ROOM_EXPIRY, "Not expired yet");
        require(room.players.length > 0, "No players to refund");

        room.refunded = true;

        uint256 refundAmount = room.ticketPrice * (100 - feePercent) / 100;
        for (uint i = 0; i < room.players.length; i++) {
            _asyncTransfer(room.players[i], refundAmount);
        }

        emit RoomRefunded(roomId);
    }

    // --------------------------------------------
    //     ADMIN: SACAR SALDO TRAVADO/EXTRA
    // --------------------------------------------

    /**
     * @notice Admin pode sacar saldo travado (referral que falhou, dust, etc)
     */
    function adminWithdraw(uint256 amount) external onlyOwner nonReentrant {
        require(address(this).balance >= amount, "Not enough balance");
        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        require(sent, "Withdraw failed");
        emit Withdraw(msg.sender, amount);
    }

    // --------------------------------------------
    //           SETTERS ADMINISTRATIVOS
    // --------------------------------------------

    function setFeePercent(uint256 _feePercent) external onlyOwner {
        require(_feePercent <= 100, "Percent too high");
        feePercent = _feePercent;
    }
    function setReferralPercent(uint256 _referralPercent) external onlyOwner {
        require(_referralPercent <= 100, "Referral percent too high");
        referralPercent = _referralPercent;
    }
    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "Invalid recipient");
        feeRecipient = _feeRecipient;
    }
    function pause() external onlyOwner {
        _pause();
    }
    function unpause() external onlyOwner {
        _unpause();
    }

    // --------------------------------------------
    //                GETTERS
    // --------------------------------------------

    function getRoomPlayers(uint256 roomId) external view returns (address[] memory) {
        return rooms[roomId].players;
    }
    function getWinners() external view returns (address[] memory) {
        return globalWinners;
    }
}
