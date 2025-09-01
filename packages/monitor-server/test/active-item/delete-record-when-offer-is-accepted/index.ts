import { graphql } from "@/graphql/types/gql";
import getApolloClientForTest from "@/test/utils/apollo-client";
import { getBasicNFT, getMarket, getWeth } from "@/test/utils/contracts";
import { mintAndList } from "@/test/utils/MintAndList";
import getPlayers from "@/test/utils/players";
import { ethers } from "ethers";
import sleep from "sleep-promise";

export default function deleteRecordWhenOfferIsAccepted() {
  it("Delete record when offer is accepted", async () => {
    const { seller, buyer } = getPlayers();
    const weth = getWeth(seller);
    const market = getMarket(seller);
    const basicNFT = getBasicNFT(seller);
    const price = ethers.parseUnits("0.3", await weth.decimals());
    await weth.connect(buyer).deposit({ value: price });
    await weth.connect(buyer).approve(market, price);
    const tokenId = await mintAndList(market, basicNFT, weth, price);
    await sleep(3000);
    market
      .connect(buyer)
      .makeOffer(
        await basicNFT.getAddress(),
        tokenId,
        price,
        await weth.getAddress()
      );
    const offerId = await new Promise<bigint>((res) => {
      market.on(market.getEvent("NftMarketplace__ItemOfferMade"), (offerId) => {
        res(offerId);
      });
    });
    await sleep(5000);
    await market.acceptOffer(offerId);
    await sleep(5000);
    const client = getApolloClientForTest();
    const { data } = await client.query({
      query: graphql(`
        query AcQuery5 {
          activeItems {
            seller
            nftAddress
            tokenId
            chainId
          }
        }
      `),
    });
    expect(data.activeItems.filter((val) => val.chainId === 31337n)).toEqual<
      typeof data.activeItems
    >([]);
  });
}
