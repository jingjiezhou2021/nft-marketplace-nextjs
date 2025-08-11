import { TypeChain } from "smart-contract";
import logListener from "./listener/logListener";
import { PrismaClient } from "../../../prisma/generated/prisma";

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
            buyer: offer[0],
            nftAddress: offer[1],
            tokenId: offer[2],
            listing: {
              price: offer[3][0],
              erc20TokenAddress: offer[3][1],
              erc20TokenName: offer[3][2],
            },
          },
          chainId: chainId,
        },
      });
    })
  );
}
