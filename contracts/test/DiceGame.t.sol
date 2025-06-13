// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/DiceGame.sol";
import "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";

contract DiceGameTest is Test {
    DiceGame public diceGame;

    address owner = address(0xABCD);
    address player1 = address(0x1);
    address player2 = address(0x2);

    uint256 constant FUND_AMOUNT = 10 ether;
    uint256 constant BET_AMOUNT = 0.01 ether;
    uint256 constant MAX_BET = 1 ether;

    function setUp() public {
        vm.deal(owner, 100 ether);
        vm.deal(player1, 10 ether);
        vm.deal(player2, 10 ether);
        uint64 subId = 123;
        address coordinator = address(0x123);
        bytes32 keyHash = bytes32("dummy_key_hash");

        vm.startPrank(owner);
        diceGame = new DiceGame(subId, coordinator, keyHash);
        // Fund the contract
        payable(address(diceGame)).transfer(FUND_AMOUNT);
        vm.stopPrank();
    }

    function testInitialState() public view {
        assertEq(diceGame.owner(), owner);
        assertEq(diceGame.houseEdge(), 150);
        assertEq(diceGame.minBet(), 0.001 ether);
        assertEq(diceGame.maxBet(), MAX_BET);
        assertEq(address(diceGame).balance, FUND_AMOUNT);
    }

    function testPlayGame() public {
        vm.startPrank(player1);
        uint256 initialBalance = player1.balance;

        // Create a game
        diceGame.playGame{value: BET_AMOUNT}(3);

        // Check game state
        DiceGame.Game memory game = diceGame.getGame(0);
        assertEq(game.player, player1);
        assertEq(game.betAmount, BET_AMOUNT);
        assertEq(game.prediction, 3);
        assertTrue(game.isComplete);

        // Check player history
        uint256[] memory gameIds = diceGame.getPlayerGames(player1);
        assertEq(gameIds.length, 1);
        assertEq(gameIds[0], 0);

        // Check balance change
        if (game.won) {
            uint256 expectedPayout = (BET_AMOUNT * 5 * (10000 - 150)) / 10000;
            assertEq(
                player1.balance,
                initialBalance - BET_AMOUNT + expectedPayout
            );
        } else {
            assertEq(player1.balance, initialBalance - BET_AMOUNT);
        }

        vm.stopPrank();
    }

    function testInvalidBets() public {
        vm.startPrank(player1);

        // Below min bet
        vm.expectRevert("Bet amount out of range");
        diceGame.playGame{value: 0.0005 ether}(1);

        // Above max bet
        vm.expectRevert("Bet amount out of range");
        diceGame.playGame{value: 2 ether}(1);

        // Invalid prediction (0)
        vm.expectRevert("Prediction must be between 1 and 6");
        diceGame.playGame{value: BET_AMOUNT}(0);

        // Invalid prediction (7)
        vm.expectRevert("Prediction must be between 1 and 6");
        diceGame.playGame{value: BET_AMOUNT}(7);

        vm.stopPrank();
    }

    function testInsufficientContractBalance() public {
        // Drain contract funds
        vm.startPrank(owner);
        diceGame.emergencyWithdraw();
        assertEq(address(diceGame).balance, 0);
        vm.stopPrank();

        // Try to play game
        vm.startPrank(player1);
        vm.expectRevert("Insufficient contract balance for potential payout");
        diceGame.playGame{value: BET_AMOUNT}(1);
        vm.stopPrank();
    }

    function testGameHistory() public {
        vm.startPrank(player1);
        diceGame.playGame{value: BET_AMOUNT}(1);
        diceGame.playGame{value: BET_AMOUNT}(2);
        vm.stopPrank();

        DiceGame.Game[] memory history = diceGame.getPlayerGameHistory(
            player1,
            1
        );
        assertEq(history.length, 1);
        assertEq(history[0].prediction, 2);
    }

    function testOwnerFunctions() public {
        vm.startPrank(owner);

        // Update house edge
        diceGame.setHouseEdge(200);
        assertEq(diceGame.houseEdge(), 200);

        // Update bet limits
        diceGame.setBetLimits(0.002 ether, 2 ether);
        assertEq(diceGame.minBet(), 0.002 ether);
        assertEq(diceGame.maxBet(), 2 ether);

        // Withdraw funds
        uint256 contractBalance = address(diceGame).balance;
        diceGame.withdrawFunds(1 ether);
        assertEq(address(diceGame).balance, contractBalance - 1 ether);

        // Emergency withdraw
        diceGame.emergencyWithdraw();
        assertEq(address(diceGame).balance, 0);

        // Fund contract
        payable(address(diceGame)).transfer(5 ether);
        assertEq(address(diceGame).balance, 5 ether);

        vm.stopPrank();
    }

    function testNonOwnerFunctions() public {
        vm.startPrank(player1);

        // FIXED: Handle custom Ownable error
        vm.expectRevert(
            abi.encodeWithSelector(
                Ownable.OwnableUnauthorizedAccount.selector,
                player1
            )
        );
        diceGame.setHouseEdge(200);

        vm.expectRevert(
            abi.encodeWithSelector(
                Ownable.OwnableUnauthorizedAccount.selector,
                player1
            )
        );
        diceGame.setBetLimits(0.002 ether, 2 ether);

        vm.expectRevert(
            abi.encodeWithSelector(
                Ownable.OwnableUnauthorizedAccount.selector,
                player1
            )
        );
        diceGame.withdrawFunds(1 ether);

        vm.expectRevert(
            abi.encodeWithSelector(
                Ownable.OwnableUnauthorizedAccount.selector,
                player1
            )
        );
        diceGame.emergencyWithdraw();

        vm.stopPrank();
    }
}
