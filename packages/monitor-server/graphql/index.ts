import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { loadSchema } from "@graphql-tools/load";
import path from "path";
import { Resolvers } from "./types/resolvers-types";
import BigIntScalar from "./BigIntScalar";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { Prisma, PrismaClient } from "../prisma/generated/prisma";
import { DefaultArgs } from "../prisma/generated/prisma/runtime/library";
type MyPrismaClient = PrismaClient<
  Prisma.PrismaClientOptions,
  never,
  DefaultArgs
>;
// interface ContextWithPrisma {
//   prisma: MyPrismaClient;
// }
export async function getApolloServerMiddleware() {
  async function deleteAllData(prisma: MyPrismaClient) {
    try {
      await prisma.nftMarketplace__ItemListed.deleteMany({});
      await prisma.nftMarketplace__ItemCanceled.deleteMany({});
      console.log("✅ All data deleted.");
    } catch (err) {
      console.error("❌ Failed to delete data:", err);
    }
  }
  const prisma = new PrismaClient();
  const typeDefs = await loadSchema(
    path.join(process.cwd(), "graphql", "schema.graphql"),
    {
      loaders: [new GraphQLFileLoader()],
    }
  );
  const resolvers: Resolvers = {
    BigInt: BigIntScalar,
    Query: {
      itemListedEvents: async (_: any, __: any) => {
        return prisma.nftMarketplace__ItemListed.findMany();
      },
      itemCanceledEvents: async (_: any, __: any) => {
        return prisma.nftMarketplace__ItemCanceled.findMany();
      },
    },
  };
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
  });
  await apolloServer.start();
  process.on("SIGINT", async () => {
    console.log("🛑 Shutting down Apollo Server...");
    try {
      await new Promise<null>((res) => {
        setTimeout(() => {
          console.log("111");
          res(null);
        }, 100);
      });
    //   await apolloServer.stop();
    //   await deleteAllData(prisma);
    //   await prisma.$disconnect();
    } catch (err) {
      console.error(err);
    }
  });
  return expressMiddleware(apolloServer, {
    async context({ req, res }) {
      return {};
    },
  });
}
