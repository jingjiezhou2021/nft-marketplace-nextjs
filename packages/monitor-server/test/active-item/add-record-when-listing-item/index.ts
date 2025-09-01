import { ethers } from "ethers";
import veryHighPrice from "./very-high-price";
import getPlayers from "@/test/utils/players";
import { getBasicNFT, getMarket, getUsdt } from "@/test/utils/contracts";
import { mintAndList } from "@/test/utils/MintAndList";
import sleep from "sleep-promise";
import getApolloClientForTest from "@/test/utils/apollo-client";
import { graphql } from "@/graphql/types/gql";

export default function addRecordWhenListingItem() {
  describe("Add record when listing item", () => {
    it("", async () => {
      const { seller } = getPlayers();
      const market = getMarket(seller);
      const basicNFT = getBasicNFT(seller);
      const usdt = getUsdt(seller);
      const price = ethers.parseUnits("1000", await usdt.decimals());
      const tokenId = await mintAndList(market, basicNFT, usdt, price);
      await sleep(5000);
      const client = getApolloClientForTest();
      const { data } = await client.query({
        query: graphql(`
          query AcQuery1 {
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
            erc20TokenAddress: await usdt.getAddress(),
            erc20TokenName: await usdt.name(),
          },
          chainId: 31337n,
        },
      ]);
    });
    veryHighPrice();
  });
}
