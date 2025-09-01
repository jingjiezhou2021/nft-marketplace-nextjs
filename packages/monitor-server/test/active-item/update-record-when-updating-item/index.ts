import { graphql } from "@/graphql/types/gql";
import getApolloClientForTest from "@/test/utils/apollo-client";
import { getBasicNFT, getMarket, getUsdt } from "@/test/utils/contracts";
import { mintAndList } from "@/test/utils/MintAndList";
import getPlayers from "@/test/utils/players";
import { ethers } from "ethers";
import sleep from "sleep-promise";

export default function updateRecordWhenUpdatingItem() {
  it("Update record when updating item", async () => {
    const { seller } = getPlayers();
    const market = getMarket(seller);
    const basicNFT = getBasicNFT(seller);
    const usdt = getUsdt(seller);
    const price = ethers.parseUnits("1000", await usdt.decimals());
    const tokenId = await mintAndList(market, basicNFT, usdt, price);
    await sleep(5000);
    await market.updateListing(basicNFT, tokenId, usdt, price * 2n);
    await sleep(5000);
    const client = getApolloClientForTest();
    const { data } = await client.query({
      query: graphql(`
        query AcQuery2 {
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
          price: price * 2n,
          erc20TokenAddress: await usdt.getAddress(),
          erc20TokenName: await usdt.name(),
        },
        chainId: 31337n,
      },
    ]);
  });
}
