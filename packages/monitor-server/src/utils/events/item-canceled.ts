import { PrismaClientKnownRequestError } from "../../../prisma/generated/prisma/runtime/edge";
import { TypeChain } from "smart-contract";
import logListener from "./listener/logListener";
import { Prisma, PrismaClient } from "@/prisma/generated/prisma";

export default function listenForItemCanceled(
  marketContract: TypeChain.contracts.nftMarketPlaceSol.NftMarketplace,
  chainId: bigint
) {
  const prisma = new PrismaClient();
  marketContract.on(
    marketContract.getEvent("NftMarketplace__ItemCanceled"),
    logListener(async (seller, nftAddress, tokenId) => {
      const existingActiveItem = await prisma.activeItem.findFirst({
        where: {
          seller,
          nftAddress,
          tokenId,
        },
        include: {
          listing: true,
          nft: true,
        },
      });
      const existingNft = existingActiveItem?.nft;
      if (!existingActiveItem) {
        throw new PrismaClientKnownRequestError(
          "active item should have existed before canceling",
          {
            code: "P2015",
            clientVersion: Prisma.prismaVersion.client,
          }
        );
      }

      const { listing } = existingActiveItem;
      const canceledEvent = await prisma.nftMarketplace__ItemCanceled.create({
        data: {
          seller,
          nftAddress,
          tokenId,
          chainId: chainId,
          listing: {
            connect: {
              id: listing.id,
            },
          },
          itemListed: {
            connect: existingActiveItem.itemListedId
              ? {
                  id: existingActiveItem.itemListedId,
                }
              : undefined,
          },
        },
      });
      await prisma.activeItem.delete({
        where: {
          id: existingActiveItem.id,
        },
      });
      if (existingNft) {
        console.log("updating canceled event to connect with existing nft...");
        await prisma.nftMarketplace__ItemCanceled.update({
          where: {
            id: canceledEvent.id,
          },
          data: {
            nftId: existingNft.id,
          },
        });
        console.log("connecting event with nft successful");
      }
    })
  );
}
