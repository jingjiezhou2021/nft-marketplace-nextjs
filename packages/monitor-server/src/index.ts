import express from "express";
import { PrismaClient } from "../prisma/generated/prisma";
import { TypeChain } from "smart-contract";
import { ethers } from "ethers";
import { DeployedAddresses } from "smart-contract";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { loadSchema } from "@graphql-tools/load";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import cors from "cors";
import path from "path";
import BigIntScalar from "../graphql/BigIntScalar";
import { Server } from "http";
const prisma = new PrismaClient();
const app = express();
let apolloServer: ApolloServer;
let server: Server;
const port = process.env.PORT || 3000;

async function deleteAllData() {
  try {
    await prisma.nftMarketplace__ItemListed.deleteMany({});
    console.log("✅ All data deleted.");
  } catch (err) {
    console.error("❌ Failed to delete data:", err);
  }
}

function setUpEventListener() {
  const rpc = process.env.RPC_URL;
  const provider = new ethers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  const marketContract = TypeChain.NftMarketplace__factory.connect(
    DeployedAddresses["31337"]["NFTMarketPlaceDev#NftMarketplace"],
    wallet
  );
  marketContract.on(
    marketContract.getEvent("NftMarketplace__ItemListed"),
    async (seller, nftAddress, tokenId, listing, _) => {
      console.log("event captured!");
      await prisma.nftMarketplace__ItemListed.create({
        data: {
          seller,
          nftAddress,
          tokenId,
          listing: {
            price: listing[0],
            erc20TokenAddress: listing[1],
            erc20TokenName: listing[2],
          },
          chainId:provider._network.chainId
        },
      });
    }
  );
}

async function setUpApolloServer() {
  const typeDefs = await loadSchema(
    path.join(process.cwd(), "graphql", "schema.graphql"),
    {
      loaders: [new GraphQLFileLoader()],
    }
  );
  apolloServer = new ApolloServer({
    typeDefs,
    resolvers: {
      BigInt: BigIntScalar,
      Query: {
        itemListedEvents: async (_: any, __: any) => {
          return prisma.nftMarketplace__ItemListed.findMany();
        },
      },
    },
  });
  await apolloServer.start();
  app.use(
    "/graphql",
    cors<cors.CorsRequest>(),
    express.json(),
    expressMiddleware(apolloServer, {
      async context({ req, res }) {
        return {
          // prisma,
        };
      },
    })
  );
  server = app.listen(port, () => {
    console.log(`🚀 Express server running on http://localhost:${port}`);
    try {
      setUpEventListener();
    } catch (err) {
      console.error("❌ Error setting up event listener:", err);
    }
  });
}

setUpApolloServer();
process.on("SIGINT", async () => {
  console.log("🛑 Shutting down...");
  await apolloServer.stop();
  await deleteAllData();
  await prisma.$disconnect();
  process.exit();
});
