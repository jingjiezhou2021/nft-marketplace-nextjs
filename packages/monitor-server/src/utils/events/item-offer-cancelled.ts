import { TypeChain } from "smart-contract";
import logListener from "./listener/logListener";
import { PrismaClient, Prisma } from "@/prisma/generated/prisma";
import { PrismaClientKnownRequestError } from "@/prisma/generated/prisma/runtime/edge";

export default function listenForItemOfferCancelled(
  marketContract: TypeChain.contracts.nftMarketPlaceSol.NftMarketplace,
  chainId: bigint
) {
  const prisma = new PrismaClient();
  marketContract.on(
    marketContract.getEvent("NftMarketPlace__ItemOfferCanceled"),
    logListener(async (offerId, offer) => {
      const previousOfferMade =
        await prisma.nftMarketplace__ItemOfferMade.findFirst({
          where: {
            chainId,
            offer: {
              is: {
                offerId,
              },
            },
          },
        });
      if (previousOfferMade === null) {
        throw new PrismaClientKnownRequestError(
          "offer should have existed before canceling",
          {
            code: "P2015",
            clientVersion: Prisma.prismaVersion.client,
          }
        );
      }
      await prisma.nftMarketplace__ItemOfferCanceled.create({
        data: {
          chainId,
          offerId: previousOfferMade.offerId,
        },
      });
    })
  );
}
