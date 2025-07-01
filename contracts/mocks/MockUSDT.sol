// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDT is ERC20 {
    constructor() ERC20("Tether USD","USDT") {}
    function decimals() public pure override returns (uint8) {
        return 8;
    }
    function mint(uint256 value) public {
        _mint(msg.sender,value);
    }
}