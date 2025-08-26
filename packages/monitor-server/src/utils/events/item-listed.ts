import { TypeChain } from "smart-contract";
import logListener from "./listener/logListener";
import { ActiveItem, PrismaClient } from "@/prisma/generated/prisma";

export default function listenForItemListed(
  marketContract: TypeChain.contracts.nftMarketPlaceSol.NftMarketplace,
  chainId: bigint
) {
  const prisma = new PrismaClient();
  marketContract.on(
    marketContract.getEvent("NftMarketplace__ItemListed"),
    logListener(async (seller, nftAddress, tokenId, listing, _) => {
      const data = {
        seller,
        nftAddress,
        tokenId,
        listing: {
          create: {
            price: listing[0].toString(),
            erc20TokenAddress: listing[1],
            erc20TokenName: listing[2],
          },
        },
        chainId: chainId,
      };
      const listedEvent = await prisma.nftMarketplace__ItemListed.create({
        data,
      });
      const existingActiveItem = await prisma.activeItem.findFirst({
        where: {
          seller,
          nftAddress,
          tokenId,
        },
      });
      let newActiveItem: ActiveItem;
      if (existingActiveItem) {
        newActiveItem = await prisma.activeItem.update({
          where: {
            id: existingActiveItem.id,
          },
          data,
        });
      } else {
        newActiveItem = await prisma.activeItem.create({
          data,
        });
      }
      const existingNFT = await prisma.nFT.findFirst({
        where: {
          contractAddress: {
            equals: nftAddress,
            mode: "insensitive",
          },
          tokenId,
          collection: {
            is: {
              chainId,
            },
          },
        },
      });
      if (existingNFT) {
        console.log("updating active item to connect with existing nft...");
        await prisma.activeItem.update({
          where: {
            id: newActiveItem.id,
          },
          data: {
            nft: {
              connect: {
                id: existingNFT.id,
              },
            },
          },
        });
        console.log("active item updated");
        console.log("updating listed event to connect with existing nft...");
        await prisma.nftMarketplace__ItemListed.update({
          where: {
            id: listedEvent.id,
          },
          data: {
            nftId: existingNFT.id,
          },
        });
        console.log("connecting event with nft successful");
      }
    })
  );
}
