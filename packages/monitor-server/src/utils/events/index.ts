import { ethers } from "ethers";
import { TypeChain, DeployedAddresses } from "smart-contract";
import { PrismaClient, Prisma } from "../../../prisma/generated/prisma";
import { PrismaClientKnownRequestError } from "../../../prisma/generated/prisma/runtime/library";
import logListener from "./listener/logListener";
export async function setUpEventListener() {
  const rpc = process.env.RPC_URL;
  const provider = new ethers.JsonRpcProvider(rpc, undefined, {
    cacheTimeout: -1,
  });
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  const marketContract = TypeChain.NftMarketplace__factory.connect(
    DeployedAddresses["31337"]["NFTMarketPlaceDev#NftMarketplace"],
    wallet
  );
  const prisma = new PrismaClient();
  marketContract.on(
    marketContract.getEvent("NftMarketplace__ItemListed"),
    logListener(async (seller, nftAddress, tokenId, listing, _) => {
      const data = {
        seller,
        nftAddress,
        tokenId,
        listing: {
          price: listing[0],
          erc20TokenAddress: listing[1],
          erc20TokenName: listing[2],
        },
        chainId: provider._network.chainId,
      };
      await prisma.nftMarketplace__ItemListed.create({
        data,
      });
      const existingActiveItem = await prisma.activeItem.findFirst({
        where: {
          seller,
          nftAddress,
          tokenId,
        },
      });
      if (existingActiveItem) {
        await prisma.activeItem.update({
          where: {
            id: existingActiveItem.id,
          },
          data,
        });
      } else {
        await prisma.activeItem.create({
          data,
        });
      }
    })
  );
  marketContract.on(
    marketContract.getEvent("NftMarketplace__ItemCanceled"),
    logListener(async (seller, nftAddress, tokenId) => {
      const existingActiveItem = await prisma.activeItem.findFirst({
        where: {
          seller,
          nftAddress,
          tokenId,
        },
      });
      if (existingActiveItem) {
        await prisma.activeItem.delete({
          where: {
            id: existingActiveItem.id,
          },
        });
      } else {
        throw new PrismaClientKnownRequestError(
          "active item should have existed before canceling",
          {
            code: "P2015",
            clientVersion: Prisma.prismaVersion.client,
          }
        );
      }
      await prisma.nftMarketplace__ItemCanceled.create({
        data: {
          seller,
          nftAddress,
          tokenId,
          chainId: provider._network.chainId,
        },
      });
    })
  );
  marketContract.on(
    marketContract.getEvent("NftMarketplace__ItemBought"),
    logListener(async (buyer, nftAddress, tokenId, listing) => {
      const existingActiveItem = await prisma.activeItem.findFirst({
        where: {
          nftAddress,
          tokenId,
        },
      });
      if (existingActiveItem) {
        await prisma.activeItem.delete({
          where: {
            id: existingActiveItem.id,
          },
        });
      } else {
        console.warn("item bought without listing");
      }
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
    })
  );
  marketContract.on(
    marketContract.getEvent("NftMarketplace__ItemOfferMade"),
    logListener(async (offerId, offer) => {
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
    })
  );
}
