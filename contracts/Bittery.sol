// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";

/// @title Bittery
/// @notice Simple lottery using Chainlink VRF v2 for randomness
contract Bittery is VRFConsumerBaseV2, ReentrancyGuard {
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
    VRFCoordinatorV2Interface private immutable coordinator;
    uint64 private immutable subscriptionId;
    bytes32 private immutable keyHash;
    uint32 private constant CALLBACK_GAS_LIMIT = 100000;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;

    uint256 private requestId;
    bool public drawing;

    /// @param _coordinator VRF coordinator address
    /// @param _subscriptionId Chainlink VRF subscription id
    /// @param _keyHash Gas lane key hash
    constructor(
        address _coordinator,
        uint64 _subscriptionId,
        bytes32 _keyHash
    ) VRFConsumerBaseV2(_coordinator) {
        owner = msg.sender;
        coordinator = VRFCoordinatorV2Interface(_coordinator);
        subscriptionId = _subscriptionId;
        keyHash = _keyHash;
    }

    /// @notice Buy lottery ticket
    function buyTicket() external payable nonReentrant {
        require(msg.value == TICKET_PRICE, "Incorrect ETH sent");
        uint256 feeAmount = (msg.value * feePercent) / 100;
        if (feeAmount > 0) {
            (bool sent, ) = payable(feeRecipient).call{value: feeAmount}("");
            require(sent, "Fee transfer failed");
        }
        players.push(msg.sender);
    }

    /// @notice Start winner selection (owner only)
    function requestRandomWinner() external onlyOwner {
        require(players.length > 0, "No players");
        require(!drawing, "Already drawing");
        drawing = true;
        requestId = coordinator.requestRandomWords(
            keyHash,
            subscriptionId,
            REQUEST_CONFIRMATIONS,
            CALLBACK_GAS_LIMIT,
            1
        );
    }

    /// @notice Chainlink VRF callback
    function fulfillRandomWords(uint256, uint256[] memory randomWords) internal override {
        uint256 index = randomWords[0] % players.length;
        recentWinner = players[index];
        players = new address[](0);
        drawing = false;
        payable(recentWinner).transfer(address(this).balance);
        emit WinnerPicked(recentWinner);
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

    /// @notice Modifier restricting to owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
}
