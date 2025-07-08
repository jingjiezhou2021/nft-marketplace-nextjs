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
    const { USDT, WETH, NFTMarketPlace, BasicNFT } =
      await ignition.deploy(NFTMarketPlaceDev);
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
  async function makeOffer(
    nftMarketPlaceContract: NftMarketplace,
    tokenID: number | bigint,
    price: bigint,
    erc20TokenAddress: string
  ) {
    nftMarketPlaceContract.makeOffer(
      await BasicNFTContract.getAddress(),
      onlyTokenID,
      standardSellingPriceUSDT / 2n,
      await USDTContract.getAddress()
    );
    const offerInfo = await new Promise<{
      offerId: bigint;
      offer: NftMarketplace.OfferStructOutput;
    }>((res) => {
      nftMarketPlaceContract.on(
        nftMarketPlaceContract.getEvent("NftMarketplace__ItemOfferMade"),
        (offerId, offer) => {
          res({ offerId, offer });
        }
      );
    });
    return offerInfo;
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
      it("buyer should not be the owner", async () => {
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
          (
            await NFTMarketPlaceContract.getPrice(
              seller,
              await BasicNFTContract.getAddress(),
              onlyTokenID
            )
          )[0]
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
      it("buyer should not be the owner", async () => {
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
        const ethBalanceBeforeWithdraw =
          await ethers.provider.getBalance(seller);
        const withdrawTx = await NFTMarketPlaceContract.withdrawProceeds(
          await WETHContract.getAddress()
        );
        const withdrawTxReceipt = await withdrawTx.wait();
        const withdrawGasCost =
          withdrawTxReceipt?.gasPrice! * withdrawTxReceipt?.gasUsed!;
        const ethBalanceAfterWithdraw =
          await ethers.provider.getBalance(seller);
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
      it("canceler should be the owner", async () => {
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
      it("canceler should be the owner", async () => {
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
  describe("update listing", () => {
    it("needs be listed first", async () => {
      await expect(
        NFTMarketPlaceContract.updateListing(
          await BasicNFTContract.getAddress(),
          onlyTokenID,
          await USDTContract.getAddress(),
          standardSellingPriceUSDT * 2n
        )
      ).revertedWithCustomError(
        NFTMarketPlaceContract,
        "NftMarketplace__NotListed"
      );

      await expect(
        NFTMarketPlaceContract.updateListing(
          await BasicNFTContract.getAddress(),
          onlyTokenID,
          await WETHContract.getAddress(),
          standardSellingPriceWETH * 2n
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
      it("updater should be the owner", async () => {
        await expect(
          NFTMarketPlaceContract.connect(buyer).updateListing(
            await BasicNFTContract.getAddress(),
            onlyTokenID,
            await USDTContract.getAddress(),
            standardSellingPriceUSDT * 2n
          )
        ).revertedWithCustomError(
          NFTMarketPlaceContract,
          "NftMarketplace__NotOwner"
        );
        await expect(
          NFTMarketPlaceContract.connect(buyer).updateListing(
            await BasicNFTContract.getAddress(),
            onlyTokenID,
            await WETHContract.getAddress(),
            standardSellingPriceWETH * 2n
          )
        ).revertedWithCustomError(
          NFTMarketPlaceContract,
          "NftMarketplace__NotOwner"
        );
      });
      it("adjust only price", async () => {
        await NFTMarketPlaceContract.updateListing(
          await BasicNFTContract.getAddress(),
          onlyTokenID,
          await USDTContract.getAddress(),
          standardSellingPriceUSDT * 2n
        );
        expect(
          await NFTMarketPlaceContract.getPrice(
            seller,
            await BasicNFTContract.getAddress(),
            onlyTokenID
          )
        ).eql([
          2n * standardSellingPriceUSDT,
          await USDTContract.getAddress(),
          "Tether USD",
        ]);
      });
      it("adjust token and price", async () => {
        await NFTMarketPlaceContract.updateListing(
          await BasicNFTContract.getAddress(),
          onlyTokenID,
          await WETHContract.getAddress(),
          standardSellingPriceWETH * 2n
        );
        expect(
          await NFTMarketPlaceContract.getPrice(
            seller,
            await BasicNFTContract.getAddress(),
            onlyTokenID
          )
        ).eql([
          2n * standardSellingPriceWETH,
          await WETHContract.getAddress(),
          "Wrapped Ether",
        ]);
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
      it("updater should be the owner", async () => {
        await expect(
          NFTMarketPlaceContract.connect(buyer).updateListing(
            await BasicNFTContract.getAddress(),
            onlyTokenID,
            await WETHContract.getAddress(),
            standardSellingPriceWETH * 2n
          )
        ).revertedWithCustomError(
          NFTMarketPlaceContract,
          "NftMarketplace__NotOwner"
        );
        await expect(
          NFTMarketPlaceContract.connect(buyer).updateListing(
            await BasicNFTContract.getAddress(),
            onlyTokenID,
            await USDTContract.getAddress(),
            standardSellingPriceUSDT * 2n
          )
        ).revertedWithCustomError(
          NFTMarketPlaceContract,
          "NftMarketplace__NotOwner"
        );
      });
      it("adjust only price", async () => {
        await NFTMarketPlaceContract.updateListing(
          await BasicNFTContract.getAddress(),
          onlyTokenID,
          await WETHContract.getAddress(),
          standardSellingPriceWETH * 2n
        );
        expect(
          await NFTMarketPlaceContract.getPrice(
            seller,
            await BasicNFTContract.getAddress(),
            onlyTokenID
          )
        ).eql([
          2n * standardSellingPriceWETH,
          await WETHContract.getAddress(),
          "Wrapped Ether",
        ]);
      });
      it("adjust token and price", async () => {
        await NFTMarketPlaceContract.updateListing(
          await BasicNFTContract.getAddress(),
          onlyTokenID,
          await USDTContract.getAddress(),
          standardSellingPriceUSDT * 2n
        );
        expect(
          await NFTMarketPlaceContract.getPrice(
            seller,
            await BasicNFTContract.getAddress(),
            onlyTokenID
          )
        ).eql([
          2n * standardSellingPriceUSDT,
          await USDTContract.getAddress(),
          "Tether USD",
        ]);
      });
    });
  });
  describe("make offer", () => {
    let buyerConnectedContract: NftMarketplace;
    beforeEach(async () => {
      buyerConnectedContract = NFTMarketPlaceContract.connect(buyer);
    });
    it("buyer should not be the owner", async () => {
      await approveAndListItem(
        onlyTokenID,
        standardSellingPriceUSDT,
        await USDTContract.getAddress()
      );
      await expect(
        NFTMarketPlaceContract.makeOffer(
          await BasicNFTContract.getAddress(),
          onlyTokenID,
          standardSellingPriceUSDT / 2n,
          await USDTContract.getAddress()
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
        buyerConnectedContract.makeOffer(
          await BasicNFTContract.getAddress(),
          onlyTokenID,
          standardSellingPriceUSDT / 2n,
          await USDTContract.getAddress()
        )
      ).revertedWithCustomError(
        NFTMarketPlaceContract,
        "NftMarketplace__ERC20TokenAllowanceNotEnough"
      );
    });
    it("make offer successful", async () => {
      await approveAndListItem(
        onlyTokenID,
        standardSellingPriceUSDT,
        await USDTContract.getAddress()
      );
      await USDTContract.connect(buyer).approve(
        await NFTMarketPlaceContract.getAddress(),
        standardSellingPriceUSDT / 2n
      );
      const offerInfo = await makeOffer(
        buyerConnectedContract,
        onlyTokenID,
        standardSellingPriceUSDT / 2n,
        await USDTContract.getAddress()
      );
      expect(offerInfo.offer[1]).equal(await BasicNFTContract.getAddress());
      expect(offerInfo.offer[2]).equal(onlyTokenID);
      expect(offerInfo.offer[3][0]).equal(standardSellingPriceUSDT / 2n);
      expect(offerInfo.offer[3][1]).equal(await USDTContract.getAddress());
      expect(await buyerConnectedContract.getOffer(offerInfo.offerId)).eql(
        offerInfo.offer
      );
      expect(
        await NFTMarketPlaceContract.getIsListed(
          seller,
          await BasicNFTContract.getAddress(),
          onlyTokenID
        )
      ).equal(true);
      expect(
        await NFTMarketPlaceContract.getProceeds(
          seller,
          await USDTContract.getAddress()
        )
      ).equal(0n);
      expect(await USDTContract.balanceOf(NFTMarketPlaceContract)).equal(0n);
      expect(await BasicNFTContract.ownerOf(0)).equal(seller);
    });
    it("make offer successful without list item", async () => {
      await USDTContract.connect(buyer).approve(
        await NFTMarketPlaceContract.getAddress(),
        standardSellingPriceUSDT / 2n
      );
      const offerInfo = await makeOffer(
        buyerConnectedContract,
        onlyTokenID,
        standardSellingPriceUSDT / 2n,
        await USDTContract.getAddress()
      );
      expect(offerInfo.offer[1]).equal(await BasicNFTContract.getAddress());
      expect(offerInfo.offer[2]).equal(onlyTokenID);
      expect(offerInfo.offer[3][0]).equal(standardSellingPriceUSDT / 2n);
      expect(offerInfo.offer[3][1]).equal(await USDTContract.getAddress());
      expect(await buyerConnectedContract.getOffer(offerInfo.offerId)).eql(
        offerInfo.offer
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
      ).equal(0n);
      expect(await USDTContract.balanceOf(NFTMarketPlaceContract)).equal(0n);
      expect(await BasicNFTContract.ownerOf(0)).equal(seller);
    });
  });
  describe("accept offer", () => {
    let buyerConnectedContract: NftMarketplace;
    beforeEach(async () => {
      buyerConnectedContract = NFTMarketPlaceContract.connect(buyer);
    });
    it("offer should exist", async () => {
      await expect(
        NFTMarketPlaceContract.acceptOffer(0)
      ).revertedWithCustomError(
        NFTMarketPlaceContract,
        "NftMarketplace__OfferNotExist"
      );
    });
    describe("offer exist", () => {
      let offerId: bigint;
      beforeEach(async () => {
        await USDTContract.connect(buyer).approve(
          await NFTMarketPlaceContract.getAddress(),
          standardSellingPriceUSDT / 2n
        );
        const offerInfo = await makeOffer(
          buyerConnectedContract,
          onlyTokenID,
          standardSellingPriceUSDT / 2n,
          await USDTContract.getAddress()
        );
        offerId = offerInfo.offerId;
      });
      it("only the owner can accept offer", async () => {
        await expect(
          buyerConnectedContract.acceptOffer(offerId)
        ).revertedWithCustomError(
          buyerConnectedContract,
          "NftMarketplace__NotOwner"
        );
      });
      it("nft should be approved to the marketplace", async () => {
        await expect(
          NFTMarketPlaceContract.acceptOffer(offerId)
        ).revertedWithCustomError(
          NFTMarketPlaceContract,
          "NftMarketplace__NotApprovedForMarketplace"
        );
      });
      describe("nft approved", () => {
        beforeEach(async () => {
          await BasicNFTContract.approve(
            await NFTMarketPlaceContract.getAddress(),
            onlyTokenID
          );
        });
        it("allowance should be enough", async () => {
          await USDTContract.connect(buyer).approve(NFTMarketPlaceContract, 0n);
          await expect(
            NFTMarketPlaceContract.acceptOffer(offerId)
          ).revertedWithCustomError(
            NFTMarketPlaceContract,
            "NftMarketplace__ERC20TokenAllowanceNotEnough"
          );
        });
        it("balance should be enough", async () => {
          await USDTContract.connect(buyer).transfer(
            seller,
            initialBalanceUSDT
          );
          await expect(
            NFTMarketPlaceContract.acceptOffer(offerId)
          ).revertedWithCustomError(
            NFTMarketPlaceContract,
            "NftMarketplace__ERC20TokenBalanceNotEnough"
          );
        });
        it("accept offer successful", async () => {
          await NFTMarketPlaceContract.acceptOffer(offerId);
          expect(
            await NFTMarketPlaceContract.getProceeds(
              seller,
              await USDTContract.getAddress()
            )
          ).equal(standardSellingPriceUSDT / 2n);
          expect(await USDTContract.balanceOf(NFTMarketPlaceContract)).equal(
            standardSellingPriceUSDT / 2n
          );
          expect(await BasicNFTContract.ownerOf(onlyTokenID)).equal(
            buyer.address
          );
        });
        it("accept offer successful will delete existing listing", async () => {
          await approveAndListItem(
            onlyTokenID,
            standardSellingPriceUSDT,
            await USDTContract.getAddress()
          );
          await NFTMarketPlaceContract.acceptOffer(offerId);
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
});
