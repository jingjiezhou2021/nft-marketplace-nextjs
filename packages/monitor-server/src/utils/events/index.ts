import { ethers } from "ethers";
import { TypeChain, DeployedAddresses } from "smart-contract";
import { PrismaClient } from "../../../prisma/generated/prisma";
export async function setUpEventListener() {
  const rpc = process.env.RPC_URL;
  const provider = new ethers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  const marketContract = TypeChain.NftMarketplace__factory.connect(
    DeployedAddresses["31337"]["NFTMarketPlaceDev#NftMarketplace"],
    wallet
  );
  const prisma = new PrismaClient();
  marketContract.on(
    marketContract.getEvent("NftMarketplace__ItemListed"),
    async (seller, nftAddress, tokenId, listing, _) => {
      await prisma.nftMarketplace__ItemListed.create({
        data: {
          seller,
          nftAddress,
          tokenId,
          listing: {
            price: listing[0],
            erc20TokenAddress: listing[1],
            erc20TokenName: listing[2],
          },
          chainId: provider._network.chainId,
        },
      });
    }
  );
  marketContract.on(
    marketContract.getEvent("NftMarketplace__ItemCanceled"),
    async (seller, nftAddress, tokenId) => {
      await prisma.nftMarketplace__ItemCanceled.create({
        data: {
          seller,
          nftAddress,
          tokenId,
          chainId: provider._network.chainId,
        },
      });
    }
  );
  marketContract.on(
    marketContract.getEvent("NftMarketplace__ItemBought"),
    async (buyer, nftAddress, tokenId, listing) => {
      await prisma.nftMarketplace__ItemBought.create({
        data: {
          buyer,
          nftAddress,
          tokenId,
          listing: {
            price: listing[0],
            erc20TokenAddress: listing[1],
            erc20TokenName: listing[2],
          },
          chainId: provider._network.chainId,
        },
      });
    }
  );
  marketContract.on(
    marketContract.getEvent("NftMarketplace__ItemOfferMade"),
    async (offerId, offer) => {
      await prisma.nftMarketplace__ItemOfferMade.create({
        data: {
          offerId,
          offer: {
            buyer: offer[0],
            nftAddress: offer[1],
            tokenId: offer[2],
            listing: {
              price: offer[3][0],
              erc20TokenAddress: offer[3][1],
              erc20TokenName: offer[3][2],
            },
          },
          chainId: provider._network.chainId,
        },
      });
    }
  );
}
