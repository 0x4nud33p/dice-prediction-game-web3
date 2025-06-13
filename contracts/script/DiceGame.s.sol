// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/DiceGame.sol";

contract DeployDiceGame is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        uint64 subId = uint64(vm.envUint("SUB_ID"));
        address coordinator = vm.envAddress("VRF_COORDINATOR");
        bytes32 keyHash = vm.envBytes32("KEY_HASH");
        // to check whether the env variables are importing or not
        console.log(deployerPrivateKey);
        console.log(coordinator);
        console.logBytes32(keyHash);
        vm.startBroadcast(deployerPrivateKey);

        DiceGame diceGame = new DiceGame(subId, coordinator, keyHash);

        // Fund contract on deployment
        // payable(address(diceGame)).transfer(0.1 ether);

        console.log("DiceGame deployed at:", address(diceGame));
        console.log("Initial contract balance:", address(diceGame).balance);

        vm.stopBroadcast();
    }
}
