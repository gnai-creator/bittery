// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
// Importações para Chainlink VRF v2.5 (V2Plus)
import "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol"; // Necessário para a estrutura ExtraArgsV1
// A interface do coordenador será automaticamente inferida pelo VRFConsumerBaseV2Plus
// import "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol"; // Não é mais estritamente necessário importar diretamente se usar VRFConsumerBaseV2Plus

/// @title Bittery
/// @notice Simple lottery using Chainlink VRF v2.5 for randomness
contract Bittery is VRFConsumerBaseV2Plus, ReentrancyGuard, Pausable { // Herda de VRFConsumerBaseV2Plus
    uint256 public constant TICKET_PRICE = 0.01 ether;
    /// @notice percentage of the ticket price taken as a fee (0-100)
    uint256 public feePercent = 5; // 5% fee by default
    /// @notice address receiving collected fees
    address public feeRecipient =
        0x9EA7EbEb25192B6d7e8e240A852e7EC56D4FB865;
    event WinnerPicked(address indexed winner);

    address[] private players;
    address public recentWinner;
    address public owner;
    uint256 public currentRound;
    // O coordenador é acessado via s_vrfCoordinator (herdado do VRFConsumerBaseV2Plus)
    // VRFCoordinatorV2Interface private immutable coordinator; // Esta linha não é mais necessária como variável de estado, pois é herdada
    uint256 private immutable subscriptionId; // Tipo alterado para uint256 para VRF v2.5
    bytes32 private immutable keyHash;
    uint32 private constant CALLBACK_GAS_LIMIT = 100000;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;

    uint256 private requestId;
    bool public drawing;

    /// @param _coordinator VRF coordinator address (para VRFConsumerBaseV2Plus)
    /// @param _subscriptionId Chainlink VRF subscription id (agora uint256 para v2.5)
    /// @param _keyHash Gas lane key hash
    constructor(
        address _coordinator,
        uint256 _subscriptionId, // Tipo alterado para uint256
        bytes32 _keyHash
    ) VRFConsumerBaseV2Plus(_coordinator) { // Construtor do base é VRFConsumerBaseV2Plus
        owner = msg.sender;
        // coordinator = VRFCoordinatorV2Interface(_coordinator); // Não é mais necessário, use s_vrfCoordinator
        subscriptionId = _subscriptionId;
        keyHash = _keyHash;
        currentRound = 1;
    }

    /// @notice Buy lottery ticket
    function buyTicket() external payable nonReentrant whenNotPaused {
        require(msg.value == TICKET_PRICE, "Incorrect ETH sent");
        uint256 feeAmount = (msg.value * feePercent) / 100;
        if (feeAmount > 0) {
            (bool sent, ) = payable(feeRecipient).call{value: feeAmount}("");
            require(sent, "Fee transfer failed");
        }
        players.push(msg.sender);
    }

    /// @notice Start winner selection (owner only)
    function requestRandomWinner() external onlyOwner whenNotPaused {
        require(players.length > 0, "No players");
        require(!drawing, "Already drawing");
        drawing = true;
        // Chamada para VRF v2.5 via s_vrfCoordinator (herdado)
        requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({ // Usando a estrutura de request do VRFV2PlusClient
                keyHash: keyHash,
                subId: subscriptionId,
                requestConfirmations: REQUEST_CONFIRMATIONS,
                callbackGasLimit: CALLBACK_GAS_LIMIT,
                numWords: 1, // Solicitando 1 palavra aleatória
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({
                        nativePayment: false // Exemplo: pagando com LINK. Defina como true se pagar em ETH nativo.
                    })
                )
            })
        );
    }

    /// @notice Chainlink VRF callback
    function fulfillRandomWords(uint256, uint256[] memory randomWords) internal override {
        uint256 index = randomWords[0] % players.length;
        recentWinner = players[index];
        players = new address[](0);
        drawing = false;
        // Melhoria: Usando .call em vez de .transfer para maior robustez
        (bool success, ) = payable(recentWinner).call{value: address(this).balance}("");
        require(success, "Winner payout failed"); // Adiciona verificação de sucesso
        emit WinnerPicked(recentWinner);
        currentRound += 1;
    }

    /// @notice Return list of current players
    function getPlayers() external view returns (address[] memory) {
        return players;
    }

    /// @notice Update the fee percentage. Only owner can call.
    /// @param _feePercent New percentage (0-100)
    function setFeePercent(uint256 _feePercent) external onlyOwner {
        require(_feePercent <= 100, "Percent too high");
        feePercent = _feePercent;
    }

    /// @notice Update the fee recipient address. Only owner can call.
    /// @param _feeRecipient Address that will receive fees
    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "Invalid recipient");
        feeRecipient = _feeRecipient;
    }

    /// @notice Withdraw any leftover ether to the owner
    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds");
        (bool sent, ) = payable(owner).call{value: balance}("");
        require(sent, "Withdraw failed");
    }

    /// @notice Pause the contract
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Unpause the contract
    function unpause() external onlyOwner {
        _unpause();
    }

    /// @notice Modifier restricting to owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
}