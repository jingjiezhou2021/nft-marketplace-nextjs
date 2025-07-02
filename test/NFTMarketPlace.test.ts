import { ethers, ignition } from "hardhat";
import NFTMarketPlaceDev from "../ignition/modules/NFTMarketPlaceDev";
import { BasicNFT, MockUSDT, NftMarketplace, WETH9 } from "../typechain-types";
import { expect } from "chai";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("NFTMarketPlace", () => {
  let USDTContract: MockUSDT;
  let WETHContract: WETH9;
  let NFTMarketPlaceContract: NftMarketplace;
  let BasicNFTContract: BasicNFT;
  let seller: HardhatEthersSigner;
  let buyer: HardhatEthersSigner;
  let standardSellingPriceUSDT: bigint;
  let standardSellingPriceWETH: bigint;
  let initialBalanceUSDT: bigint;
  let onlyTokenID: bigint;
  beforeEach(async () => {
    const { USDT, WETH, NFTMarketPlace, BasicNFT } = await ignition.deploy(
      NFTMarketPlaceDev
    );
    USDTContract = USDT as unknown as MockUSDT;
    WETHContract = WETH as unknown as WETH9;
    NFTMarketPlaceContract = NFTMarketPlace as unknown as NftMarketplace;
    BasicNFTContract = BasicNFT as unknown as BasicNFT;
    seller = (await ethers.getSigners())[0];
    buyer = (await ethers.getSigners())[1];
    standardSellingPriceUSDT = ethers.parseUnits(
      "1000",
      await USDTContract.decimals()
    );
    standardSellingPriceWETH = ethers.parseUnits(
      "0.2",
      await WETHContract.decimals()
    );
    BasicNFTContract.mint();
    onlyTokenID = await new Promise<bigint>((res) => {
      BasicNFTContract.on(
        BasicNFTContract.getEvent("NFTMinted"),
        (_, tokenID) => {
          res(tokenID);
        }
      );
    });
    initialBalanceUSDT = ethers.parseUnits(
      "3000",
      await USDTContract.decimals()
    );
    for (const user of [buyer, seller]) {
      await USDTContract.connect(user).mint(initialBalanceUSDT);
    }
  });
  async function approveAndListItem(
    tokenID: number | bigint,
    price: bigint,
    erc20TokenAddress: string
  ) {
    await BasicNFTContract.approve(
      await NFTMarketPlaceContract.getAddress(),
      tokenID
    );
    await NFTMarketPlaceContract.listItem(
      await BasicNFTContract.getAddress(),
      tokenID,
      price,
      erc20TokenAddress
    );
  }
  describe("list item", () => {
    it("needs approve", async () => {
      await expect(
        NFTMarketPlaceContract.listItem(
          await BasicNFTContract.getAddress(),
          onlyTokenID,
          standardSellingPriceUSDT,
          await USDTContract.getAddress()
        )
      ).revertedWithCustomError(
        NFTMarketPlaceContract,
        "NftMarketplace__NotApprovedForMarketplace"
      );
    });
    it("item exists", async () => {
      await approveAndListItem(
        onlyTokenID,
        standardSellingPriceUSDT,
        await USDTContract.getAddress()
      );
      expect(
        await NFTMarketPlaceContract.getIsListed(
          seller,
          await BasicNFTContract.getAddress(),
          onlyTokenID
        )
      ).equal(true);
    });
    it("suppot native price", async () => {
      await approveAndListItem(
        onlyTokenID,
        standardSellingPriceWETH,
        await WETHContract.getAddress()
      );
      expect(
        await NFTMarketPlaceContract.getIsListed(
          seller,
          await BasicNFTContract.getAddress(),
          onlyTokenID
        )
      ).equal(true);
    });
  });
  describe("buy item", () => {
    let buyerConnectedContract: NftMarketplace;
    beforeEach(async () => {
      buyerConnectedContract = NFTMarketPlaceContract.connect(buyer);
    });
    it("needs be listed first", async () => {
      await expect(
        buyerConnectedContract.buyItem(
          seller,
          await BasicNFTContract.getAddress(),
          onlyTokenID
        )
      ).revertedWithCustomError(
        buyerConnectedContract,
        "NftMarketplace__NotListed"
      );
    });
    describe("trade with erc20 token", () => {
      it("buyer is not the owner", async () => {
        await approveAndListItem(
          onlyTokenID,
          standardSellingPriceUSDT,
          await USDTContract.getAddress()
        );
        await expect(
          NFTMarketPlaceContract.buyItem(
            seller,
            await BasicNFTContract.getAddress(),
            onlyTokenID
          )
        ).revertedWithCustomError(
          NFTMarketPlaceContract,
          "NftMarketplace__IsOwner"
        );
      });
      it("needs allowance", async () => {
        await approveAndListItem(
          onlyTokenID,
          standardSellingPriceUSDT,
          await USDTContract.getAddress()
        );
        await expect(
          buyerConnectedContract.buyItem(
            seller,
            await BasicNFTContract.getAddress(),
            onlyTokenID
          )
        ).revertedWithCustomError(
          NFTMarketPlaceContract,
          "NftMarketplace__ERC20TokenAllowanceNotEnough"
        );
      });
      it("buy item successful", async () => {
        await approveAndListItem(
          onlyTokenID,
          standardSellingPriceUSDT,
          await USDTContract.getAddress()
        );
        await USDTContract.connect(buyer).approve(
          await NFTMarketPlaceContract.getAddress(),
          await NFTMarketPlaceContract.getPrice(
            seller,
            await BasicNFTContract.getAddress(),
            onlyTokenID
          )
        );
        await buyerConnectedContract.buyItem(
          seller,
          await BasicNFTContract.getAddress(),
          onlyTokenID
        );
        expect(await USDTContract.balanceOf(buyer)).equal(
          initialBalanceUSDT - standardSellingPriceUSDT
        );
        expect(
          await NFTMarketPlaceContract.getIsListed(
            seller,
            await BasicNFTContract.getAddress(),
            onlyTokenID
          )
        ).equal(false);
        expect(
          await NFTMarketPlaceContract.getProceeds(
            seller,
            await USDTContract.getAddress()
          )
        ).equal(standardSellingPriceUSDT);
        expect(await USDTContract.balanceOf(NFTMarketPlaceContract)).equal(
          standardSellingPriceUSDT
        );
        expect(await BasicNFTContract.ownerOf(0)).equal(buyer);
        const USDTBalanceBeforeWithDraw = await USDTContract.balanceOf(seller);
        await NFTMarketPlaceContract.withdrawProceeds(
          await USDTContract.getAddress()
        );
        const USDTBalanceAfterWithDraw = await USDTContract.balanceOf(seller);
        expect(USDTBalanceAfterWithDraw - USDTBalanceBeforeWithDraw).equal(
          standardSellingPriceUSDT
        );
      });
    });
    describe("trade with native token", () => {
      it("buyer is not the owner", async () => {
        await approveAndListItem(
          onlyTokenID,
          standardSellingPriceWETH,
          await WETHContract.getAddress()
        );
        await expect(
          NFTMarketPlaceContract.buyItem(
            seller,
            await BasicNFTContract.getAddress(),
            onlyTokenID
          )
        ).revertedWithCustomError(
          NFTMarketPlaceContract,
          "NftMarketplace__IsOwner"
        );
      });
      it("eth amount must be enough", async () => {
        await approveAndListItem(
          onlyTokenID,
          standardSellingPriceWETH,
          await WETHContract.getAddress()
        );
        await expect(
          buyerConnectedContract.buyItem(
            seller,
            await BasicNFTContract.getAddress(),
            onlyTokenID,
            {
              value: standardSellingPriceWETH - 1n,
            }
          )
        ).revertedWithCustomError(
          NFTMarketPlaceContract,
          "NftMarketplace__PriceNotMet"
        );
      });
      it("buy item successful", async () => {
        await approveAndListItem(
          onlyTokenID,
          standardSellingPriceWETH,
          await WETHContract.getAddress()
        );
        const balanceBefore = await ethers.provider.getBalance(buyer);
        const tx = await buyerConnectedContract.buyItem(
          seller,
          await BasicNFTContract.getAddress(),
          onlyTokenID,
          { value: standardSellingPriceWETH }
        );
        const txReceipt = await tx.wait();
        const gasCost = txReceipt?.gasUsed! * txReceipt?.gasPrice!;
        const balanceAfter = await ethers.provider.getBalance(buyer);
        expect(balanceAfter).equal(
          balanceBefore - standardSellingPriceWETH - gasCost
        );
        expect(
          await NFTMarketPlaceContract.getIsListed(
            seller,
            await BasicNFTContract.getAddress(),
            onlyTokenID
          )
        ).equal(false);
        expect(
          await NFTMarketPlaceContract.getProceeds(
            seller,
            await WETHContract.getAddress()
          )
        ).equal(standardSellingPriceWETH);
        expect(await WETHContract.balanceOf(NFTMarketPlaceContract)).equal(
          standardSellingPriceWETH
        );
        expect(await BasicNFTContract.ownerOf(0)).equal(buyer);
        const ethBalanceBeforeWithdraw = await ethers.provider.getBalance(
          seller
        );
        const withdrawTx = await NFTMarketPlaceContract.withdrawProceeds(
          await WETHContract.getAddress()
        );
        const withdrawTxReceipt = await withdrawTx.wait();
        const withdrawGasCost =
          withdrawTxReceipt?.gasPrice! * withdrawTxReceipt?.gasUsed!;
        const ethBalanceAfterWithdraw = await ethers.provider.getBalance(
          seller
        );
        expect(ethBalanceAfterWithdraw).equal(
          ethBalanceBeforeWithdraw + standardSellingPriceWETH - withdrawGasCost
        );
      });
    });
  });
  describe("cancel listing", () => {
    it("needs be listed first", async () => {
      await expect(
        NFTMarketPlaceContract.cancelListing(
          await BasicNFTContract.getAddress(),
          onlyTokenID
        )
      ).revertedWithCustomError(
        NFTMarketPlaceContract,
        "NftMarketplace__NotListed"
      );
    });
    describe("trade with erc20 token", () => {
      beforeEach(async () => {
        await approveAndListItem(
          onlyTokenID,
          standardSellingPriceUSDT,
          await USDTContract.getAddress()
        );
      });
      it("canceler is not the owner", async () => {
        await expect(
          NFTMarketPlaceContract.connect(buyer).cancelListing(
            await BasicNFTContract.getAddress(),
            onlyTokenID
          )
        ).revertedWithCustomError(
          NFTMarketPlaceContract,
          "NftMarketplace__NotOwner"
        );
      });
      it("cancel successful", async () => {
        await NFTMarketPlaceContract.cancelListing(
          await BasicNFTContract.getAddress(),
          onlyTokenID
        );
        expect(
          await NFTMarketPlaceContract.getIsListed(
            seller,
            await BasicNFTContract.getAddress(),
            onlyTokenID
          )
        ).equal(false);
      });
    });
    describe("trade with native token", () => {
      beforeEach(async () => {
        await approveAndListItem(
          onlyTokenID,
          standardSellingPriceWETH,
          await WETHContract.getAddress()
        );
      });
      it("canceler is not the owner", async () => {
        await expect(
          NFTMarketPlaceContract.connect(buyer).cancelListing(
            await BasicNFTContract.getAddress(),
            onlyTokenID
          )
        ).revertedWithCustomError(
          NFTMarketPlaceContract,
          "NftMarketplace__NotOwner"
        );
      });
      it("cancel successful", async () => {
        await NFTMarketPlaceContract.cancelListing(
          await BasicNFTContract.getAddress(),
          onlyTokenID
        );
        expect(
          await NFTMarketPlaceContract.getIsListed(
            seller,
            await BasicNFTContract.getAddress(),
            onlyTokenID
          )
        ).equal(false);
      });
    });
  });
});
