// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";

contract DiceGame is ReentrancyGuard, Ownable {
    struct Game {
        address player;
        uint256 betAmount;
        uint8 prediction;
        uint8 result;
        bool isComplete;
        uint256 timestamp;
        bool won;
    }

    mapping(uint256 => Game) public games;
    mapping(address => uint256[]) public playerGames;

    uint256 public gameCounter;
    uint256 public houseEdge = 150; // 1.5% (150/10000)
    uint256 public minBet = 0.001 ether;
    uint256 public maxBet = 1 ether;

    event GameCreated(
        uint256 indexed gameId,
        address indexed player,
        uint256 betAmount,
        uint8 prediction
    );
    event GameCompleted(
        uint256 indexed gameId,
        address indexed player,
        uint8 result,
        bool won,
        uint256 payout
    );
    event HouseEdgeUpdated(uint256 newHouseEdge);
    event BetLimitsUpdated(uint256 newMinBet, uint256 newMaxBet);
    event contractBalanceUpdated(uint256 newBalance);

    constructor() Ownable(msg.sender) {}

    modifier validBet() {
        require(
            msg.value >= minBet && msg.value <= maxBet,
            "Bet amount out of range"
        );
        _;
    }

    modifier validPrediction(uint8 _prediction) {
        require(
            _prediction >= 1 && _prediction <= 6,
            "Prediction must be between 1 and 6"
        );
        _;
    }

    /// @param _prediction Player's predicted dice number
    function playGame(
        uint8 _prediction
    ) external payable validBet validPrediction(_prediction) nonReentrant {
        require(
            address(this).balance >= msg.value * 5,
            "Insufficient contract balance for potential payout"
        );

        uint256 gameId = gameCounter++;

        games[gameId] = Game({
            player: msg.sender,
            betAmount: msg.value,
            prediction: _prediction,
            result: 0,
            isComplete: false,
            timestamp: block.timestamp,
            won: false
        });

        playerGames[msg.sender].push(gameId);

        emit GameCreated(gameId, msg.sender, msg.value, _prediction);

        // Will be upgraded to Chainlink VRF for secure randomness for further versions
        // For now, using block properties for simplicity
        uint8 diceResult = uint8(
            (uint256(
                keccak256(
                    abi.encodePacked(
                        block.timestamp,
                        block.prevrandao,
                        msg.sender,
                        gameId
                    )
                )
            ) % 6) + 1
        );

        games[gameId].result = diceResult;
        games[gameId].isComplete = true;

        bool won = (diceResult == _prediction);
        games[gameId].won = won;

        uint256 payout = 0;
        if (won) {
            // 5x multiplier minus house edge
            uint256 grossPayout = msg.value * 5;
            uint256 houseAmount = (grossPayout * houseEdge) / 10000;
            payout = grossPayout - houseAmount;

            (bool success, ) = payable(msg.sender).call{value: payout}("");
            require(success, "Payout failed");
        }

        emit GameCompleted(gameId, msg.sender, diceResult, won, payout);
    }

    /// @notice Get game details by ID
    /// @param _gameId ID of the game to retrieve
    function getGame(uint256 _gameId) external view returns (Game memory) {
        return games[_gameId];
    }

    /// @notice Get all game IDs for a player
    /// @param _player Address of the player
    function getPlayerGames(
        address _player
    ) external view returns (uint256[] memory) {
        return playerGames[_player];
    }

    /// @notice Get player's recent game history
    /// @param _player Address of the player
    /// @param _limit Maximum number of games to return
    function getPlayerGameHistory(
        address _player,
        uint256 _limit
    ) external view returns (Game[] memory) {
        uint256[] memory gameIds = playerGames[_player];
        uint256 length = gameIds.length > _limit ? _limit : gameIds.length;
        Game[] memory history = new Game[](length);

        for (uint256 i = 0; i < length; i++) {
            uint256 gameId = gameIds[gameIds.length - 1 - i]; // Most recent first
            history[i] = games[gameId];
        }

        return history;
    }

    /// @notice Get contract statistics
    function getContractStats()
        external
        view
        returns (
            uint256 totalGames,
            uint256 contractBalance,
            uint256 currentHouseEdge,
            uint256 currentMinBet,
            uint256 currentMaxBet
        )
    {
        return (gameCounter, address(this).balance, houseEdge, minBet, maxBet);
    }

    // ========== OWNER FUNCTIONS ========== //

    /// @notice Set house edge percentage (in basis points)
    /// @param _houseEdge New house edge (e.g., 150 = 1.5%)
    function setHouseEdge(uint256 _houseEdge) external onlyOwner {
        require(_houseEdge <= 1000, "House edge cannot exceed 10%"); // Max 10%
        houseEdge = _houseEdge;
        emit HouseEdgeUpdated(_houseEdge);
    }

    /// @notice Set betting limits
    /// @param _minBet New minimum bet amount (in wei)
    /// @param _maxBet New maximum bet amount (in wei)
    function setBetLimits(uint256 _minBet, uint256 _maxBet) external onlyOwner {
        require(_minBet > 0, "Min bet must be at least 1 wei");
        require(_minBet < _maxBet, "Min bet must be less than max bet");
        minBet = _minBet;
        maxBet = _maxBet;
        emit BetLimitsUpdated(_minBet, _maxBet);
    }

    /// @notice Fund contract balance
    function fundContract() external payable onlyOwner {
        require(msg.value > 0, "Must send Ether to fund contract");
        emit contractBalanceUpdated(address(this).balance);
    }

    /// @notice Withdraw funds from contract
    /// @param _amount Amount to withdraw (in wei)
    function withdrawFunds(uint256 _amount) external onlyOwner {
        require(_amount <= address(this).balance, "Insufficient balance");
        (bool success, ) = payable(owner()).call{value: _amount}("");
        require(success, "Withdrawal failed");
        emit contractBalanceUpdated(address(this).balance);
    }

    /// @notice Emergency withdraw all funds
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Emergency withdrawal failed");
        emit contractBalanceUpdated(address(this).balance);
    }

    /// @notice Receive Ether to fund contract
    receive() external payable {
        require(msg.value > 0, "Must send Ether to fund contract");
        emit contractBalanceUpdated(address(this).balance);
    }
}
