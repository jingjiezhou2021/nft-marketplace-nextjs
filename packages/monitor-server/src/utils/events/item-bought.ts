import { TypeChain } from "smart-contract";
import logListener from "./listener/logListener";
import { PrismaClient } from "@/prisma/generated/prisma";
import { Prisma } from "@/prisma/generated/prisma";

export default function listenForItemBought(
  marketContract: TypeChain.contracts.nftMarketPlaceSol.NftMarketplace,
  chainId: bigint
) {
  const prisma = new PrismaClient();
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
            create: {
              price: listing[0].toString(),
              erc20TokenAddress: listing[1],
              erc20TokenName: listing[2],
            },
          },
          chainId: chainId,
        },
      });
    })
  );
}
