import { TypeChain } from "smart-contract";
import logListener from "./listener/logListener";
import { PrismaClient } from "@/prisma/generated/prisma";

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
          offerId,
          offer: {
            create: {
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
            },
          },
          chainId: chainId,
        },
      });
    })
  );
}
