import { graphql } from "@/graphql/types/gql";
import getApolloClientForTest from "@/test/utils/apollo-client";
import { getBasicNFT, getMarket, getWeth } from "@/test/utils/contracts";
import { mintAndList } from "@/test/utils/MintAndList";
import getPlayers from "@/test/utils/players";
import { ethers } from "ethers";
import sleep from "sleep-promise";

export default function veryHighPrice() {
  it("very high price", async () => {
    const { seller } = getPlayers();
    const weth = getWeth(seller);
    const market = getMarket(seller);
    const basicNFT = getBasicNFT(seller);
    const price = ethers.parseUnits("19368.3747", await weth.decimals());
    const tokenId = await mintAndList(market, basicNFT, weth, price);
    await sleep(5000);
    const client = getApolloClientForTest();
    const { data } = await client.query({
      query: graphql(`
        query AcQuery1_1 {
          activeItems {
            seller
            nftAddress
            tokenId
            listing {
              price
              erc20TokenAddress
              erc20TokenName
            }
            chainId
          }
        }
      `),
    });
    expect(data.activeItems.filter((val) => val.chainId === 31337n)).toEqual<
      typeof data.activeItems
    >([
      {
        __typename: "ActiveItem",
        seller: seller.address,
        nftAddress: await basicNFT.getAddress(),
        tokenId,
        listing: {
          __typename: "Listing",
          price,
          erc20TokenAddress: await weth.getAddress(),
          erc20TokenName: await weth.name(),
        },
        chainId: 31337n,
      },
    ]);
  });
}
