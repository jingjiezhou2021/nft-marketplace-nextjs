// SPDX-License-Identifier: MIT
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
pragma solidity ^0.8.0;

contract BasicNFT is ERC721 {
    uint256 private s_tokenCounter;
    string private i_tokenURI;
    event NFTMinted(address indexed minter, uint256 indexed tokenId);
    constructor(string memory myTokenURI) ERC721("Dogie","Dog") {
        s_tokenCounter=0;
        i_tokenURI=myTokenURI;
    }
    function mint() public returns (uint256) {
        _safeMint(msg.sender,s_tokenCounter);
        emit NFTMinted(msg.sender, s_tokenCounter++);
        return s_tokenCounter;
    }
    function getTokenCounter() public view  returns (uint256){
        return s_tokenCounter;
    }

    function tokenURI(uint256 tokenID) public view override returns (string memory) {
        return i_tokenURI;
    }
}