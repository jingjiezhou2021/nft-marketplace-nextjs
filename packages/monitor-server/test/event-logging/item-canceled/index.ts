import { graphql } from "@/graphql/types/gql";
import getApolloClientForTest from "@/test/utils/apollo-client";
import { getBasicNFT, getMarket, getWeth } from "@/test/utils/contracts";
import { mintAndList } from "@/test/utils/MintAndList";
import getPlayers from "@/test/utils/players";
import { ethers } from "ethers";
import sleep from "sleep-promise";

export default function itemCanceled() {
  it("NftMarketplace__ItemCanceled", async () => {
    const { seller } = getPlayers();
    const weth = getWeth(seller);
    const market = getMarket(seller);
    const basicNFT = getBasicNFT(seller);
    const price = ethers.parseUnits("0.3", await weth.decimals());
    const tokenId = await mintAndList(market, basicNFT, weth, price);
    await sleep(5000);
    await market.cancelListing(basicNFT, tokenId);
    await sleep(5000);
    const client = getApolloClientForTest();
    const { data } = await client.query({
      query: graphql(`
        query Query2 {
          nftMarketplace__ItemCanceleds {
            seller
            nftAddress
            tokenId
            chainId
            itemListed {
              seller
              tokenId
              nftAddress
            }
          }
        }
      `),
    });
    expect(
      data.nftMarketplace__ItemCanceleds.filter((val) => val.chainId === 31337n)
    ).toEqual<typeof data.nftMarketplace__ItemCanceleds>([
      {
        __typename: "NftMarketplace__ItemCanceled",
        seller: seller.address,
        nftAddress: await basicNFT.getAddress(),
        tokenId,
        chainId: 31337n,
        itemListed: {
          __typename: "NftMarketplace__ItemListed",
          nftAddress: await basicNFT.getAddress(),
          tokenId,
          seller: seller.address,
        },
      },
    ]);
  });
}
