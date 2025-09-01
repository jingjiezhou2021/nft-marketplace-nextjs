import { graphql } from "@/graphql/types/gql";
import getApolloClientForTest from "@/test/utils/apollo-client";
import { getBasicNFT, getMarket, getWeth } from "@/test/utils/contracts";
import { mintAndList } from "@/test/utils/MintAndList";
import getPlayers from "@/test/utils/players";
import { ethers } from "ethers";
import sleep from "sleep-promise";

export default function itemOfferAccepted() {
  it("NftMarketplace__ItemOfferAccepted", async () => {
    const { seller, buyer } = getPlayers();
    const weth = getWeth(seller);
    const market = getMarket(seller);
    const basicNFT = getBasicNFT(seller);
    const price = ethers.parseUnits("0.3", await weth.decimals());
    await weth.connect(buyer).deposit({ value: price });
    await weth.connect(buyer).approve(market, price);
    const tokenId = await mintAndList(market, basicNFT, weth, price);
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
    await sleep(10000);
    await market.acceptOffer(offerId);
    await sleep(5000);
    const client = getApolloClientForTest();
    const { data } = await client.query({
      query: graphql(`
        query NftMarketplace__ItemOfferAccepteds {
          nftMarketplace__ItemOfferAccepteds {
            chainId
            offer {
              buyer
              offerId
              listing {
                erc20TokenAddress
                erc20TokenName
                price
              }
              nftAddress
              tokenId
              itemOfferMade {
                offer {
                  offerId
                }
              }
            }
          }
        }
      `),
    });
    expect(
      data.nftMarketplace__ItemOfferAccepteds.filter(
        (val) => val.chainId === 31337n
      )
    ).toEqual<typeof data.nftMarketplace__ItemOfferAccepteds>([
      {
        __typename: "NftMarketplace__ItemOfferAccepted",
        chainId: 31337n,
        offer: {
          __typename: "Offer",
          buyer: buyer.address,
          nftAddress: await basicNFT.getAddress(),
          tokenId,
          offerId,
          listing: {
            __typename: "Listing",
            price,
            erc20TokenAddress: await weth.getAddress(),
            erc20TokenName: await weth.name(),
          },
          itemOfferMade: {
            __typename: "NftMarketplace__ItemOfferMade",
            offer: {
              __typename: "Offer",
              offerId,
            },
          },
        },
      },
    ]);
  });
}
