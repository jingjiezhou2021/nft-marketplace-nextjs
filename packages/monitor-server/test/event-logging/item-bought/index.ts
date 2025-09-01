import { graphql } from "@/graphql/types/gql";
import getApolloClientForTest from "@/test/utils/apollo-client";
import {
  getBasicNFT,
  getMarket,
  getUsdt,
  getWeth,
} from "@/test/utils/contracts";
import { mintAndList } from "@/test/utils/MintAndList";
import getPlayers from "@/test/utils/players";
import { ethers } from "ethers";
import sleep from "sleep-promise";

export default function itemBought() {
  it("NftMarketplace__ItemBought", async () => {
    const { seller, buyer } = getPlayers();
    const usdt = getUsdt(seller);
    const weth = getWeth(seller);
    const market = getMarket(seller);
    const basicNFT = getBasicNFT(seller);
    const priceUSDT = ethers.parseUnits("1200", await usdt.decimals());
    const priceWETH = ethers.parseUnits("0.4", await weth.decimals());
    await weth.connect(buyer).deposit({ value: priceWETH });
    await usdt.connect(buyer).mint(priceUSDT);
    const tokenIdUSDT = await mintAndList(market, basicNFT, usdt, priceUSDT);
    const tokenIdWETH = await mintAndList(market, basicNFT, weth, priceWETH);
    await usdt.connect(buyer).approve(market, priceUSDT);
    await weth.connect(buyer).approve(market, priceWETH);
    await market.connect(buyer).buyItem(seller, basicNFT, tokenIdUSDT);
    await market
      .connect(buyer)
      .buyItem(seller, basicNFT, tokenIdWETH, { value: priceWETH });
    await sleep(5000);
    const client = getApolloClientForTest();
    const { data } = await client.query({
      query: graphql(`
        query Query3 {
          nftMarketplace__ItemBoughts(orderBy: { tokenId: asc }) {
            buyer
            nftAddress
            tokenId
            listing {
              price
              erc20TokenAddress
              erc20TokenName
            }
            chainId
            itemListed {
              nftAddress
              tokenId
              seller
            }
          }
        }
      `),
    });
    expect(
      data.nftMarketplace__ItemBoughts.filter((val) => val.chainId === 31337n)
    ).toEqual<typeof data.nftMarketplace__ItemBoughts>([
      {
        __typename: "NftMarketplace__ItemBought",
        buyer: buyer.address,
        nftAddress: await basicNFT.getAddress(),
        tokenId: tokenIdUSDT,
        listing: {
          __typename: "Listing",
          price: priceUSDT,
          erc20TokenAddress: await usdt.getAddress(),
          erc20TokenName: await usdt.name(),
        },
        chainId: 31337n,
        itemListed: {
          __typename: "NftMarketplace__ItemListed",
          nftAddress: await basicNFT.getAddress(),
          tokenId: tokenIdUSDT,
          seller: seller.address,
        },
      },
      {
        __typename: "NftMarketplace__ItemBought",
        buyer: buyer.address,
        nftAddress: await basicNFT.getAddress(),
        tokenId: tokenIdWETH,
        listing: {
          __typename: "Listing",
          price: priceWETH,
          erc20TokenAddress: await weth.getAddress(),
          erc20TokenName: await weth.name(),
        },
        chainId: 31337n,
        itemListed: {
          __typename: "NftMarketplace__ItemListed",
          nftAddress: await basicNFT.getAddress(),
          tokenId: tokenIdWETH,
          seller: seller.address,
        },
      },
    ]);
  });
}
