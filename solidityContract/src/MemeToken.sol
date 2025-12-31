// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MemeToken
 * @dev Simple ERC-20 meme token deployed by BaseMemeLauncher
 * Creator receives initial supply, token is fully tradeable on Uniswap V3
 */
contract MemeToken is ERC20, Ownable {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address creator
    ) ERC20(name, symbol) Ownable(creator) {
        // Mint full supply to creator
        _mint(creator, initialSupply);
    }

    /**
     * @dev Allows burning tokens
     */
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }

    /**
     * @dev Allows owner to mint additional tokens (controlled by launcher)
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
