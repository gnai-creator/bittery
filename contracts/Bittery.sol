// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

/**
 * @title Bittery
 * @author
 * @notice Contrato de loteria descentralizada com salas fixas e global.
 * - O owner cria as salas via backend/cron job.
 * - Usuários compram tickets, podendo indicar referral.
 * - Sorteio ocorre por Chainlink VRF.
 * - Prêmios/reembolsos sacados via PullPayment.
 */
contract Bittery is VRFConsumerBaseV2Plus, ReentrancyGuard, Pausable {

    /// @notice Estrutura de uma sala de sorteio
    struct Room {
        uint256 id;
        uint256 ticketPrice;
        uint256 maxPlayers;
        address[] players;
        bool drawing;
        address winner;
        uint256 createdAt;
        bool expired;
        bool refunded;
        address paymentToken;
    }

    // Parâmetros configuráveis
    uint256 public feePercent = 5; // Taxa (%) do prêmio
    uint256 public referralPercent = 50; // % da fee vai para referral
    address public feeRecipient; // Quem recebe a fee

    // Parâmetros VRF
    uint256 private immutable subscriptionId;
    bytes32 private immutable keyHash;
    uint32 private constant CALLBACK_GAS_LIMIT = 100000;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint256 public constant ROOM_EXPIRY = 7 days;

    // Controle das salas e pagamentos
    uint256 public nextRoomId;
    mapping(uint256 => Room) public rooms;
    mapping(uint256 => uint256) public requestToRoomId;
    address[] public globalWinners;
    mapping(address => uint256) private _payments; // saldo de saque PullPayment

    // Eventos
    event RoomCreated(uint256 indexed roomId, uint256 price, uint256 maxPlayers, address paymentToken);
    event TicketBought(uint256 indexed roomId, address indexed player, address referrer);
    event WinnerPicked(uint256 indexed roomId, address indexed winner);
    event RoomExpired(uint256 indexed roomId);
    event RoomRefunded(uint256 indexed roomId);
    event Withdraw(address indexed to, uint256 amount);

    /**
     * @notice Construtor
     * @param _coordinator Endereço Chainlink VRF Coordinator
     * @param _subscriptionId ID de subscription Chainlink VRF
     * @param _keyHash Key hash Chainlink VRF
     * @param _feeRecipient Endereço que recebe a fee
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

    /**
     * @notice Owner cria uma sala.
     * @param ticketPrice Preço do ticket em wei
     * @param maxPlayers Máximo de jogadores (0 = global)
     * @param paymentToken Token de pagamento (0x0 = nativo)
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

    /**
     * @notice Usuário compra ticket em sala (apenas ETH/MATIC nativo)
     * @param roomId Id da sala
     * @param referrer Endereço referral (opcional, não pode ser o próprio)
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

        if (room.maxPlayers > 0 && block.timestamp > room.createdAt + ROOM_EXPIRY) {
            room.expired = true;
            emit RoomExpired(roomId);
            revert("Room expired");
        }

        uint256 feeAmount = (msg.value * feePercent) / 100;
        uint256 referralBonus = 0;

        if (referrer != address(0)) {
            referralBonus = (feeAmount * referralPercent) / 100;
            // Corrigido: warning removido, valor retornado explicitamente ignorado
            (bool success, ) = payable(referrer).call{value: referralBonus}(bytes(""));
        }

        uint256 remainingFee = feeAmount - referralBonus;
        if (remainingFee > 0) {
            (bool feeSent, ) = payable(feeRecipient).call{value: remainingFee}("");
            require(feeSent, "Fee transfer failed");
        }

        room.players.push(msg.sender);
        emit TicketBought(roomId, msg.sender, referrer);

        if (room.maxPlayers > 0 && room.players.length == room.maxPlayers) {
            _requestRandomWinner(roomId);
        }
    }

    /**
     * @notice Owner dispara sorteio na sala global (sem limite de jogadores)
     * @param roomId Id da sala global
     */
    function triggerGlobalDraw(uint256 roomId) external {
        Room storage room = rooms[roomId];
        require(msg.sender == owner(), "Only owner/cron");
        require(room.maxPlayers == 0, "Not a global room");
        require(!room.drawing, "Draw in progress");
        require(room.players.length > 1, "Not enough players");
        _requestRandomWinner(roomId);
    }

    /**
     * @dev Solicita aleatoriedade à Chainlink para sorteio.
     * @param roomId Id da sala a sortear
     */
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
     * @notice Chainlink VRF callback: escolhe e registra o ganhador
     */
    function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) internal override {
        require(msg.sender == address(s_vrfCoordinator), "Only VRF Coordinator");

        uint256 roomId = requestToRoomId[requestId];
        Room storage room = rooms[roomId];
        require(room.drawing, "Not drawing");

        uint256 index = randomWords[0] % room.players.length;
        address winner = room.players[index];
        room.winner = winner;
        room.drawing = false;

        uint256 pot = room.ticketPrice * room.players.length;
        uint256 payout = pot * (100 - feePercent) / 100;

        _asyncTransfer(winner, payout);

        globalWinners.push(winner);
        emit WinnerPicked(roomId, winner);
    }

    /**
     * @notice Owner pode reembolsar todos os jogadores de sala expirada
     * @param roomId Id da sala expirada
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

    /**
     * @notice Owner pode sacar saldo travado (referrals falhos, dust)
     * @param amount Quantidade em wei
     */
    function adminWithdraw(uint256 amount) external onlyOwner nonReentrant {
        require(address(this).balance >= amount, "Not enough balance");
        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        require(sent, "Withdraw failed");
        emit Withdraw(msg.sender, amount);
    }

    // ========================= SETTERS ================================

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
    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    // ========================= GETTERS ================================

    function getRoomPlayers(uint256 roomId) external view returns (address[] memory) {
        return rooms[roomId].players;
    }
    function getWinners() external view returns (address[] memory) {
        return globalWinners;
    }

    // ===================== PULLPAYMENT ================================

    /**
     * @notice Consulta saldo disponível para saque do endereço
     * @param dest Endereço
     */
    function payments(address dest) public view returns (uint256) {
        return _payments[dest];
    }

    /**
     * @dev Interno: credita saldo de saque
     */
    function _asyncTransfer(address dest, uint256 amount) internal {
        _payments[dest] += amount;
    }

    /**
     * @notice Usuário pode sacar seu prêmio/reembolso
     * @param payee Endereço de saque (normalmente msg.sender)
     */
    function withdrawPayments(address payable payee) public nonReentrant {
        uint256 payment = _payments[payee];
        require(payment != 0, "No funds to withdraw");
        _payments[payee] = 0;
        (bool sent, ) = payee.call{value: payment}("");
        require(sent, "Withdraw failed");
        emit Withdraw(payee, payment);
    }
}
