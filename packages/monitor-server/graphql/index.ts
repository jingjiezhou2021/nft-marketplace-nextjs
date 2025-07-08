import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { loadSchema } from "@graphql-tools/load";
import path from "path";
import { Resolvers } from "./types/resolvers-types";
import BigIntScalar from "./BigIntScalar";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { Prisma, PrismaClient } from "../prisma/generated/prisma";
import { DefaultArgs } from "../prisma/generated/prisma/runtime/library";
interface MyContext {
  prisma: MyPrismaClient;
}
type MyPrismaClient = PrismaClient<
  Prisma.PrismaClientOptions,
  never,
  DefaultArgs
>;
async function deleteAllData(prisma: MyPrismaClient) {
  try {
    await prisma.nftMarketplace__ItemListed.deleteMany({});
    await prisma.nftMarketplace__ItemCanceled.deleteMany({});
    console.log("✅ All data deleted.");
  } catch (err) {
    console.error("❌ Failed to delete data:", err);
  }
}
export function getApolloServerMiddleware() {
  process.on("SIGINT", async () => {
    console.log("🛑 Shutting down Apollo Server...");
    await apolloServer.stop();
    await deleteAllData(prisma);
    await prisma.$disconnect();
    process.exit(0);
  });
  const prisma = new PrismaClient();
  let apolloServer: ApolloServer<MyContext>;
  return loadSchema(path.join(process.cwd(), "graphql", "schema.graphql"), {
    loaders: [new GraphQLFileLoader()],
  })
    .then((typeDefs) => {
      const resolvers: Resolvers<MyContext> = {
        BigInt: BigIntScalar,
        Query: {
          itemListedEvents: async (_: any, __: any, { prisma }) => {
            return prisma.nftMarketplace__ItemListed.findMany();
          },
          itemCanceledEvents: async (_: any, __: any, { prisma }) => {
            return prisma.nftMarketplace__ItemCanceled.findMany();
          },
        },
      };
      apolloServer = new ApolloServer({
        typeDefs,
        resolvers,
      });
      return apolloServer.start();
    })
    .then(() => {
      return expressMiddleware(apolloServer, {
        async context({ req, res }) {
          return {
            prisma,
          };
        },
      });
    });
}
