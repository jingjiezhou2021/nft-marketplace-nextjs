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
      });
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
      await prisma.activeItem.delete({
        where: {
          id: existingActiveItem.id,
        },
      });
      await prisma.nftMarketplace__ItemCanceled.create({
        data: {
          seller,
          nftAddress,
          tokenId,
          chainId: chainId,
          listing,
        },
      });
    })
  );
}
