// SPDX-License-Identifier: MIT
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract StandardNFT is ERC721 {
    using Strings for uint256;

    event NFTMinted(address indexed minter, uint256 indexed tokenId);

    string private i_baseUrl;
    uint256 private s_tokenCounter;

    constructor(
        string memory baseUrl,
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) {
        i_baseUrl = baseUrl;
        s_tokenCounter = 1;
    }

    function baseUrl() external view returns (string memory) {
        return i_baseUrl;
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        if (tokenId < s_tokenCounter) {
            return string(abi.encodePacked(i_baseUrl, "/", tokenId.toString()));
        }
        else {
            revert ERC721NonexistentToken(tokenId);
        }
    }

    function mint() public returns (uint256) {
        _safeMint(msg.sender, s_tokenCounter);
        emit NFTMinted(msg.sender, s_tokenCounter++);
        return s_tokenCounter;
    }
}
