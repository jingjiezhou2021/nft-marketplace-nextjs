import { TypeChain } from "smart-contract";
import logListener from "./listener/logListener";
import { PrismaClient } from "../../../prisma/generated/prisma";

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
          price: listing[0],
          erc20TokenAddress: listing[1],
          erc20TokenName: listing[2],
        },
        chainId: chainId,
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
}
