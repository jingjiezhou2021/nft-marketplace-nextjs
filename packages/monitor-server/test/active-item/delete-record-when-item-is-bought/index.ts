import { graphql } from "@/graphql/types/gql";
import getApolloClientForTest from "@/test/utils/apollo-client";
import { getBasicNFT, getMarket, getWeth } from "@/test/utils/contracts";
import { mintAndList } from "@/test/utils/MintAndList";
import getPlayers from "@/test/utils/players";
import { ethers } from "ethers";
import sleep from "sleep-promise";

export default function deleteRecordWhenItemIsBought() {
  it("Delete record when item is bought", async () => {
    const { seller, buyer } = getPlayers();
    const weth = getWeth(seller);
    const market = getMarket(seller);
    const basicNFT = getBasicNFT(seller);
    const priceWETH = ethers.parseUnits("0.4", await weth.decimals());
    await weth.connect(buyer).deposit({ value: priceWETH });
    const tokenIdWETH = await mintAndList(market, basicNFT, weth, priceWETH);
    await sleep(5000);
    await weth.connect(buyer).approve(market, priceWETH);
    await market
      .connect(buyer)
      .buyItem(seller, basicNFT, tokenIdWETH, { value: priceWETH });
    await sleep(5000);
    const client = getApolloClientForTest();
    const { data } = await client.query({
      query: graphql(`
        query AcQuery4 {
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
