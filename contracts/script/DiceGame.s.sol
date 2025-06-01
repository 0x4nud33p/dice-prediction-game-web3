// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/DiceGame.sol";

contract DeployDiceGame is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        
        DiceGame diceGame = new DiceGame();
        
        // Fund contract on deployment
        payable(address(diceGame)).transfer(5 ether);
        
        console.log("DiceGame deployed at:", address(diceGame));
        console.log("Initial contract balance:", address(diceGame).balance);
        
        vm.stopBroadcast();
    }
}