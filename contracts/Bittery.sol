// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

contract Bittery is VRFConsumerBaseV2Plus, ReentrancyGuard, Pausable {
    struct Room {
        uint256 id;
        uint256 ticketPrice;
        uint256 maxPlayers;
        address[] players;
        bool drawing;
        address winner;
    }

    uint256 public feePercent = 5;
    uint256 public referralPercent = 50;
    address public feeRecipient;

    uint256 private immutable subscriptionId;
    bytes32 private immutable keyHash;
    uint32 private constant CALLBACK_GAS_LIMIT = 100000;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;

    uint256 public nextRoomId;
    mapping(uint256 => Room) public rooms;
    mapping(uint256 => uint256) public requestToRoomId;
    address[] public globalWinners;

    event RoomCreated(uint256 indexed roomId, uint256 price, uint256 maxPlayers);
    event TicketBought(uint256 indexed roomId, address indexed player);
    event WinnerPicked(uint256 indexed roomId, address indexed winner);

    constructor(
        address _coordinator,
        uint256 _subscriptionId,
        bytes32 _keyHash,
        address _feeRecipient
    ) VRFConsumerBaseV2Plus(_coordinator) {
        subscriptionId = _subscriptionId;
        keyHash = _keyHash;
        feeRecipient = _feeRecipient;
    }

    function createRoom(uint256 ticketPrice, uint256 maxPlayers) external onlyOwner {
        require(ticketPrice > 0, "Invalid price");
        require(maxPlayers >= 2, "Minimum 2 players");

        Room storage newRoom = rooms[nextRoomId];
        newRoom.id = nextRoomId;
        newRoom.ticketPrice = ticketPrice;
        newRoom.maxPlayers = maxPlayers;

        emit RoomCreated(nextRoomId, ticketPrice, maxPlayers);
        nextRoomId++;
    }

    function buyTicket(uint256 roomId, address referrer) external payable nonReentrant whenNotPaused {
        Room storage room = rooms[roomId];
        require(!room.drawing, "Draw in progress");
        require(msg.value == room.ticketPrice, "Incorrect ETH sent");
        require(referrer != msg.sender, "Can't refer yourself");

        uint256 feeAmount = (msg.value * feePercent) / 100;
        uint256 referralBonus = 0;

        if (referrer != address(0)) {
            referralBonus = (feeAmount * referralPercent) / 100;
            (bool referralSent, ) = payable(referrer).call{value: referralBonus}("");
            require(referralSent, "Referral payout failed");
        }

        uint256 remainingFee = feeAmount - referralBonus;
        if (remainingFee > 0) {
            (bool feeSent, ) = payable(feeRecipient).call{value: remainingFee}("");
            require(feeSent, "Fee transfer failed");
        }

        room.players.push(msg.sender);
        emit TicketBought(roomId, msg.sender);

        if (room.players.length == room.maxPlayers) {
            _requestRandomWinner(roomId);
        }
    }

    function _requestRandomWinner(uint256 roomId) internal {
        Room storage room = rooms[roomId];
        require(!room.drawing, "Already drawing");
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

    function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) internal override {
        uint256 roomId = requestToRoomId[requestId];
        Room storage room = rooms[roomId];

        uint256 index = randomWords[0] % room.players.length;
        address winner = room.players[index];
        room.winner = winner;

        (bool success, ) = payable(winner).call{value: room.ticketPrice * room.players.length * (100 - feePercent) / 100}("");
        require(success, "Winner payout failed");

        globalWinners.push(winner);
        emit WinnerPicked(roomId, winner);
    }

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

    function getRoomPlayers(uint256 roomId) external view returns (address[] memory) {
        return rooms[roomId].players;
    }

    function getWinners() external view returns (address[] memory) {
        return globalWinners;
    }
}
