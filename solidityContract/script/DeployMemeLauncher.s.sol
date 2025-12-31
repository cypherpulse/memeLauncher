// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {BaseMemeLauncher} from "../src/BaseMemeLauncher.sol";

/**
 * @title DeployMemeLauncher
 * @dev Deployment script for BaseMemeLauncher on Base Testnet
 * 
 * Usage:
 * forge script script/DeployMemeLauncher.s.sol --rpc-url $BASE_TESTNET_RPC --broadcast
 * 
 * Environment:
 * - BASE_TESTNET_RPC: https://84532.rpc.thirdweb.com/ (or Ankr, Alchemy, etc.)
 * - KEYSTROKE: Your deployment wallet private key
 */
contract DeployMemeLauncher is Script {
    address public constant BASE_TESTNET_ROUTER = 0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD;
    address public constant BASE_TESTNET_FACTORY = 0x33128a8fC17869897DcE68Ed026D694621F6fDad;

    function run() public {
        // Start broadcasting transactions
        vm.startBroadcast();

        // Get deployer address (when using --account, this will be the account address)
        address deployer = msg.sender;

        console.log("Deploying BaseMemeLauncher...");
        console.log("Deployer:", deployer);
        console.log("Treasury (same as deployer):", deployer);

        // Deploy BaseMemeLauncher with deployer as treasury
        // This allows the deployer to collect fees initially
        BaseMemeLauncher launcher = new BaseMemeLauncher(deployer);

        // Verify deployment
        console.log("BaseMemeLauncher deployed at:", address(launcher));
        console.log("Treasury:", launcher.TREASURY());
        console.log("Min Launch ETH:", launcher.minLaunchEth());
        console.log("Uniswap Router:", launcher.uniswapRouter());
        console.log("Uniswap Factory:", launcher.uniswapFactory());

        vm.stopBroadcast();

        // Print deployment info
        console.log("\n========== DEPLOYMENT SUCCESS ==========");
        console.log("BaseMemeLauncher Address:", address(launcher));
        console.log("Network: Base Testnet (ChainID: 84532)");
        console.log("Treasury receives launch fees");
        console.log("Min Launch ETH: 0.1 ETH");
        console.log("Launch Fee: 1% (100 BPS)");
        console.log("========================================\n");
    }
}
