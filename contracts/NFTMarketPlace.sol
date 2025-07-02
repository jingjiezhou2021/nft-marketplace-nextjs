// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {WETH9} from "@aave/core-v3/contracts/dependencies/weth/WETH9.sol";

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";


error NftMarketplace__PriceNotMet(address nftAddress, uint256 tokenId, uint256 price);
error NftMarketplace__ItemNotForSale(address nftAddress, uint256 tokenId);
error NftMarketplace__NotListed(
    address owner,
    address nftAddress,
    uint256 tokenId
);
error NftMarketplace__AlreadyListed(
    address owner,
    address nftAddress,
    uint256 tokenId
);
error NftMarketplace__NoProceeds();
error NftMarketplace__NotOwner();
error NftMarketplace__IsOwner();
error NftMarketplace__NotApprovedForMarketplace();
error NftMarketplace__PriceMustBeAboveZero();
error NftMarketplace__ERC20TokenAllowanceNotEnough();
error NftMarketplace__WithdrawFailed();

contract NftMarketplace is ReentrancyGuard{
    event NftMarketplace__ItemListed(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        Listing listing
    );
    event NftMarketplace__ItemBought(
        address indexed buyer,
        address indexed nftAddress,
        uint256 indexed tokenId,
        Listing listing
    );
    event NftMarketplace__ItemCanceled(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId
    );

    struct Listing {
        uint256 price;
        address erc20TokenAddress;
        string erc20TokenName;
    }

    modifier notListed(
        address owner,
        address nftAddress,
        uint256 tokenId
    ) {
        if (getIsListed(owner, nftAddress, tokenId)) {
            revert NftMarketplace__AlreadyListed(owner, nftAddress, tokenId);
        }
        _;
    }

    modifier isListed(
        address owner,
        address nftAddress,
        uint256 tokenId
    ) {
        if (!getIsListed(owner, nftAddress, tokenId)) {
            revert NftMarketplace__NotListed(owner, nftAddress, tokenId);
        }
        _;
    }

    modifier isOwner(
        address nftAddress,
        uint256 tokenId,
        address spender
    ) {
        if (!getIsOwner(nftAddress, tokenId, spender)) {
            revert NftMarketplace__NotOwner();
        }
        _;
    }

    modifier isNotOwner(
        address nftAddress,
        uint256 tokenId,
        address spender
    ) {
        if (getIsOwner(nftAddress, tokenId, spender)) {
            revert NftMarketplace__IsOwner();
        }
        _;
    }

    mapping(address => mapping(address => mapping(uint256 => Listing)))
        private s_listings;

    mapping(address => mapping(address => uint256)) private s_proceeds;

    WETH9 internal immutable i_weth;

    constructor(address payable wETHAddress) {
        i_weth=WETH9(wETHAddress);
    }

    function getIsListed(
        address owner,
        address nftAddress,
        uint256 tokenID
    ) public view returns (bool) {
        Listing memory listing = s_listings[owner][nftAddress][tokenID];
        return listing.price > 0;
    }

    function getIsOwner(
        address nftAddress,
        uint256 tokenId,
        address spender
    ) public view returns (bool) {
        IERC721 nft = IERC721(nftAddress);
        address owner = nft.ownerOf(tokenId);
        return spender == owner;
    }

    function getPrice(
        address owner,
        address nftAddress,
        uint256 tokenID
    ) public view returns (Listing memory){
        return s_listings[owner][nftAddress][tokenID];
    }

    function getProceeds(address seller,address erc20TokenAddress) public view returns (uint256) {
        return s_proceeds[seller][erc20TokenAddress];
    }

    function listItem(
        address nftAddress,
        uint256 tokenId,
        uint256 price,
        address erc20TokenAddress
    )
        external
        notListed(msg.sender, nftAddress, tokenId)
        isOwner(nftAddress, tokenId, msg.sender)
        nonReentrant
    {
        if (price <= 0) {
            revert NftMarketplace__PriceMustBeAboveZero();
        }
        IERC721 nft = IERC721(nftAddress);
        IERC20Metadata erc20Token = IERC20Metadata(erc20TokenAddress);
        string memory erc20TokenName = erc20Token.name();
        if (nft.getApproved(tokenId) != address(this)) {
            revert NftMarketplace__NotApprovedForMarketplace();
        }
        Listing memory listing = Listing(
            price,
            erc20TokenAddress,
            erc20TokenName
        );
        s_listings[msg.sender][nftAddress][tokenId] = listing;
        emit NftMarketplace__ItemListed(
            msg.sender,
            nftAddress,
            tokenId,
            listing
        );
    }

    function buyItem(
        address owner,
        address nftAddress,
        uint256 tokenId
    )
        external
        payable
        isListed(owner, nftAddress, tokenId)
        isNotOwner(nftAddress, tokenId, msg.sender)
        nonReentrant
    {
        Listing memory listedItem = s_listings[owner][nftAddress][tokenId];
        if (msg.value > 0) {
            // native payment
            if (msg.value < listedItem.price) {
                revert NftMarketplace__PriceNotMet(nftAddress, tokenId, listedItem.price);
            }
            else {
                i_weth.deposit{value:msg.value}();
            }
        } else {
            // pay with erc20 token
            IERC20 erc20Token = IERC20(listedItem.erc20TokenAddress);
            uint256 allowance = erc20Token.allowance(msg.sender, address(this));
            if (allowance < listedItem.price) {
                revert NftMarketplace__ERC20TokenAllowanceNotEnough();
            } else {
                erc20Token.transferFrom(msg.sender,address(this), listedItem.price);
            }
        }
        // https://fravoll.github.io/solidity-patterns/pull_over_push.html
        delete (s_listings[owner][nftAddress][tokenId]);
        s_proceeds[owner][listedItem.erc20TokenAddress] += listedItem.price;
        IERC721(nftAddress).safeTransferFrom(
            owner,
            msg.sender,
            tokenId
        );
        emit NftMarketplace__ItemBought(msg.sender, nftAddress, tokenId, listedItem);
    }

    function withdrawProceeds(address erc20TokenAddress) external nonReentrant{
        uint256 proceeds = s_proceeds[msg.sender][erc20TokenAddress];
        if (proceeds <= 0) {
            revert NftMarketplace__NoProceeds();
        }
        s_proceeds[msg.sender][erc20TokenAddress] = 0;
        if(erc20TokenAddress==address(i_weth)) {
            i_weth.withdraw(proceeds);
            (bool success, ) = payable(msg.sender).call{value: proceeds}("");
            if(!success) {
                revert NftMarketplace__WithdrawFailed();
            }
        }
        else {
            IERC20 erc20Token=IERC20(erc20TokenAddress);
            erc20Token.transfer(msg.sender,proceeds);
        }
    }

    function cancelListing(address nftAddress, uint256 tokenId)
        external
        isOwner(nftAddress, tokenId, msg.sender)
        isListed(msg.sender,nftAddress, tokenId)
    {
        delete (s_listings[msg.sender][nftAddress][tokenId]);
        emit NftMarketplace__ItemCanceled(msg.sender, nftAddress, tokenId);
    }

    function updateListing(
        address nftAddress,
        uint256 tokenId,
        address erc20TokenAddress,
        uint256 newPrice
    )
        external
        isOwner(nftAddress, tokenId, msg.sender)
        isListed(msg.sender,nftAddress, tokenId)
        nonReentrant
    {
        //We should check the value of `newPrice` and revert if it's below zero (like we also check in `listItem()`)
        if (newPrice <= 0) {
            revert NftMarketplace__PriceMustBeAboveZero();
        }
        IERC20Metadata erc20Token = IERC20Metadata(erc20TokenAddress);
        string memory erc20TokenName = erc20Token.name();
        Listing memory listing = Listing(newPrice,erc20TokenAddress,erc20TokenName);
        s_listings[msg.sender][nftAddress][tokenId] = listing;
        emit NftMarketplace__ItemListed(msg.sender, nftAddress, tokenId, listing);
    }


    receive() external payable {

    }

    fallback() external payable {

    }
}
