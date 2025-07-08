import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { Prisma, PrismaClient } from "../prisma/generated/prisma";
import { DefaultArgs } from "../prisma/generated/prisma/runtime/library";
import getSchema from "./schema";
interface Context {
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
    await prisma.nftMarketplace__ItemBought.deleteMany({});
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
  let apolloServer: ApolloServer<Context>;
  return getSchema()
    .then((schema) => {
      apolloServer = new ApolloServer({
        schema,
      });
      return apolloServer.start();
    })
    .then(() => {
      return expressMiddleware<Context>(apolloServer, {
        async context({ req, res }) {
          return { prisma };
        },
      });
    });
}
