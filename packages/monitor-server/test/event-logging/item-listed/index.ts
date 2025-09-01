import { ethers } from "ethers";
import { mintAndList } from "../../utils/MintAndList";
import { getBasicNFT, getMarket, getUsdt } from "@/test/utils/contracts";
import getPlayers from "@/test/utils/players";
import sleep from "sleep-promise";
import getApolloClientForTest from "@/test/utils/apollo-client";
import { graphql } from "@/graphql/types/gql";
import veryHighPrice from "./very-high-price";
export default function itemListed() {
  describe("NftMarketplace__ItemListed", () => {
    it("", async () => {
      const { seller } = getPlayers();
      const usdt = getUsdt(seller);
      const market = getMarket(seller);
      const basicNFT = getBasicNFT(seller);
      const price = ethers.parseUnits("1000", await usdt.decimals());
      const tokenId = await mintAndList(market, basicNFT, usdt, price);
      await sleep(5000);
      const { data } = await getApolloClientForTest().query({
        query: graphql(`
          query Query1 {
            nftMarketplace__ItemListeds {
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
      expect(
        data.nftMarketplace__ItemListeds.filter((val) => val.chainId === 31337n)
      ).toEqual<typeof data.nftMarketplace__ItemListeds>([
        {
          __typename: "NftMarketplace__ItemListed",
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
