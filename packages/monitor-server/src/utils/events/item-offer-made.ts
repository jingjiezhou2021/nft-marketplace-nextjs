import { TypeChain } from "smart-contract";
import logListener from "./listener/logListener";
import { PrismaClient, Prisma } from "@/prisma/generated/prisma";

export default function listenForItemOfferMade(
  marketContract: TypeChain.contracts.nftMarketPlaceSol.NftMarketplace,
  chainId: bigint
) {
  const prisma = new PrismaClient();
  marketContract.on(
    marketContract.getEvent("NftMarketplace__ItemOfferMade"),
    logListener(async (offerId, offer) => {
      await prisma.nftMarketplace__ItemOfferMade.create({
        data: {
          offer: {
            create: {
              offerId,
              chainId,
              buyer: offer[0],
              nftAddress: offer[1],
              tokenId: offer[2],
              listing: {
                create: {
                  price: offer[3][0].toString(),
                  erc20TokenAddress: offer[3][1],
                  erc20TokenName: offer[3][2],
                },
              },
            } satisfies Prisma.OfferCreateWithoutItemOfferMadeInput,
          },
          chainId: chainId,
        },
      });
      const existingNft = await prisma.nFT.findFirst({
        where: {
          contractAddress: {
            equals: offer[1],
            mode: "insensitive",
          },
          tokenId: offer[2],
          collection: {
            is: {
              chainId: {
                equals: chainId,
              },
            },
          },
        },
      });
      if (existingNft) {
        await prisma.offer.update({
          where: {
            chainId_offerId: {
              chainId,
              offerId,
            },
          },
          data: {
            nftId: existingNft.id,
          },
        });
      }
    })
  );
}
