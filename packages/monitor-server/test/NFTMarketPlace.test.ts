import { ethers, HDNodeWallet, Mnemonic } from "ethers";
import { TypeChain, DeployedAddresses } from "smart-contract";
import { mintAndList } from "./utils/MintAndList";
import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import { graphql } from "../graphql/types/gql";
import sleep from "sleep-promise";
describe("NFTMarketPlace Monitor Server", () => {
  const rpc = process.env.RPC_URL;
  const provider = new ethers.JsonRpcProvider(rpc, undefined, {
    cacheTimeout: -1,
  });
  const mnemonic = Mnemonic.fromPhrase(process.env.MNEMONIC!);
  const [seller, buyer] = Array(2)
    .fill(0)
    .map((_, index) => {
      const path = `m/44'/60'/0'/0/${index}`;
      const wallet = HDNodeWallet.fromMnemonic(mnemonic, path);
      return wallet.connect(provider);
    });
  console.log("seller:", seller.address);
  console.log("buyer:", buyer.address);
  console.log("contract addresses", DeployedAddresses);
  const basicNFT = TypeChain.BasicNFT__factory.connect(
    DeployedAddresses["31337"]["NFTMarketPlaceDev#BasicNFT"],
    seller
  );
  const market = TypeChain.NftMarketplace__factory.connect(
    DeployedAddresses["31337"]["NFTMarketPlaceDev#NftMarketplace"],
    seller
  );
  const usdt = TypeChain.MockUSDT__factory.connect(
    DeployedAddresses["31337"]["NFTMarketPlaceDev#MockUSDT"],
    seller
  );
  const weth = TypeChain.WETH9__factory.connect(
    DeployedAddresses["31337"]["NFTMarketPlaceDev#WETH9"],
    seller
  );
  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: new ApolloLink((operation, forward) => {
      return forward(operation).map((response) => {
        const dfs = (data) => {
          if (data && typeof data === "object") {
            for (const key of Object.keys(data)) {
              if (typeof data[key] === "number") {
                data[key] = BigInt(data[key]);
              }
              dfs(data[key]);
            }
          }
        };
        dfs(response.data);
        return response;
      });
    }).concat(
      new HttpLink({ uri: `http://localhost:${process.env.port}/graphql` })
    ),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: "no-cache",
      },
      query: {
        fetchPolicy: "no-cache",
      },
      mutate: {
        fetchPolicy: "no-cache",
      },
    },
  });
  async function clear() {
    await client.mutate({
      mutation: graphql(`
        mutation clear {
          deleteManyNftMarketplace__ItemListed {
            count
          }
          deleteManyNftMarketplace__ItemOfferMade {
            count
          }
          deleteManyNftMarketplace__ItemCanceled {
            count
          }
          deleteManyNftMarketplace__ItemBought {
            count
          }
          deleteManyActiveItem {
            count
          }
        }
      `),
    });
  }
  beforeEach(async () => {
    await clear();
  });
  afterEach(async () => {
    await clear();
  });
  describe("Event Logging", () => {
    it("NftMarketplace__ItemListed", async () => {
      const price = ethers.parseUnits("1000", await usdt.decimals());
      const tokenId = await mintAndList(market, basicNFT, usdt, price);
      await sleep(5000);
      const { data } = await client.query({
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
      expect(data.nftMarketplace__ItemListeds).toEqual<
        typeof data.nftMarketplace__ItemListeds
      >([
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
          chainId: provider._network.chainId,
        },
      ]);
    });
    it("NftMarketplace__ItemCanceled", async () => {
      const price = ethers.parseUnits("0.3", await weth.decimals());
      const tokenId = await mintAndList(market, basicNFT, weth, price);
      await sleep(5000);
      await market.cancelListing(basicNFT, tokenId);
      await sleep(5000);
      const { data } = await client.query({
        query: graphql(`
          query Query2 {
            nftMarketplace__ItemCanceleds {
              seller
              nftAddress
              tokenId
              chainId
            }
          }
        `),
      });
      expect(data.nftMarketplace__ItemCanceleds).toEqual<
        typeof data.nftMarketplace__ItemCanceleds
      >([
        {
          __typename: "NftMarketplace__ItemCanceled",
          seller: seller.address,
          nftAddress: await basicNFT.getAddress(),
          tokenId,
          chainId: provider._network.chainId,
        },
      ]);
    });
    it("NftMarketplace__ItemBought", async () => {
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
            }
          }
        `),
      });
      expect(data.nftMarketplace__ItemBoughts).toEqual<
        typeof data.nftMarketplace__ItemBoughts
      >([
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
          chainId: provider._network.chainId,
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
          chainId: provider._network.chainId,
        },
      ]);
    });
    it("NftMarketplace__ItemOfferMade", async () => {
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
        market.on(
          market.getEvent("NftMarketplace__ItemOfferMade"),
          (offerId) => {
            res(offerId);
          }
        );
      });
      await sleep(5000);
      const { data } = await client.query({
        query: graphql(`
          query Query4 {
            nftMarketplace__ItemOfferMades {
              offerId
              offer {
                buyer
                nftAddress
                tokenId
                listing {
                  price
                  erc20TokenAddress
                  erc20TokenName
                }
              }
              chainId
            }
          }
        `),
      });
      expect(data.nftMarketplace__ItemOfferMades).toEqual<
        typeof data.nftMarketplace__ItemOfferMades
      >([
        {
          __typename: "NftMarketplace__ItemOfferMade",
          offerId,
          offer: {
            __typename: "Offer",
            buyer: buyer.address,
            nftAddress: await basicNFT.getAddress(),
            tokenId,
            listing: {
              __typename: "Listing",
              price,
              erc20TokenAddress: await weth.getAddress(),
              erc20TokenName: await weth.name(),
            },
          },
          chainId: provider._network.chainId,
        },
      ]);
    });
  });
  describe("ActiveItem", () => {
    it("Add record when listing item", async () => {
      const price = ethers.parseUnits("1000", await usdt.decimals());
      const tokenId = await mintAndList(market, basicNFT, usdt, price);
      await sleep(5000);
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
      expect(data.activeItems).toEqual<typeof data.activeItems>([
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
          chainId: provider._network.chainId,
        },
      ]);
    });
    it("Update record when updating item", async () => {
      const price = ethers.parseUnits("1000", await usdt.decimals());
      const tokenId = await mintAndList(market, basicNFT, usdt, price);
      await sleep(5000);
      await market.updateListing(basicNFT, tokenId, usdt, price * 2n);
      await sleep(5000);
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
      expect(data.activeItems).toEqual<typeof data.activeItems>([
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
          chainId: provider._network.chainId,
        },
      ]);
    });
    it("Delete record when canceling item", async () => {
      const price = ethers.parseUnits("0.3", await weth.decimals());
      const tokenId = await mintAndList(market, basicNFT, weth, price);
      await sleep(5000);
      await market.cancelListing(basicNFT, tokenId);
      await sleep(5000);
      const { data } = await client.query({
        query: graphql(`
          query AcQuery3 {
            activeItems {
              seller
              nftAddress
              tokenId
            }
          }
        `),
      });
      expect(data.activeItems).toEqual<typeof data.activeItems>([]);
    });
    it("Delete record when item is bought", async () => {
      const priceWETH = ethers.parseUnits("0.4", await weth.decimals());
      await weth.connect(buyer).deposit({ value: priceWETH });
      const tokenIdWETH = await mintAndList(market, basicNFT, weth, priceWETH);
      await sleep(5000);
      await weth.connect(buyer).approve(market, priceWETH);
      await market
        .connect(buyer)
        .buyItem(seller, basicNFT, tokenIdWETH, { value: priceWETH });
      await sleep(5000);
      const { data } = await client.query({
        query: graphql(`
          query AcQuery4 {
            activeItems {
              seller
              nftAddress
              tokenId
            }
          }
        `),
      });
      expect(data.activeItems).toEqual<typeof data.activeItems>([]);
    });
    it("Delete record when offer is accepted", async () => {
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
        market.on(
          market.getEvent("NftMarketplace__ItemOfferMade"),
          (offerId) => {
            res(offerId);
          }
        );
      });
      await market.acceptOffer(offerId);
      await sleep(5000);
      const { data } = await client.query({
        query: graphql(`
          query AcQuery5 {
            activeItems {
              seller
              nftAddress
              tokenId
            }
          }
        `),
      });
      expect(data.activeItems).toEqual<typeof data.activeItems>([]);
    });
  });
});
