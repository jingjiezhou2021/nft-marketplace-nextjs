import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { Prisma, PrismaClient } from "@/prisma/generated/prisma";
import { DefaultArgs } from "@/prisma/generated/prisma/runtime/library";
import getSchema from "./schema";
export interface Context {
  prisma: MyPrismaClient;
}
type MyPrismaClient = PrismaClient<
  Prisma.PrismaClientOptions,
  never,
  DefaultArgs
>;
async function deleteAllHardhatData(prisma: MyPrismaClient) {
  try {
    await prisma.nftMarketplace__ItemListed.deleteMany({
      where: {
        chainId: 31337,
      },
    });
    await prisma.nftMarketplace__ItemCanceled.deleteMany({
      where: {
        chainId: 31337,
      },
    });
    await prisma.nftMarketplace__ItemBought.deleteMany({
      where: {
        chainId: 31337,
      },
    });
    await prisma.nftMarketplace__ItemOfferMade.deleteMany({
      where: {
        chainId: 31337,
      },
    });
    await prisma.activeItem.deleteMany({
      where: {
        chainId: 31337,
      },
    });
    await prisma.offer.deleteMany({
      where: {
        chainId: 31337,
      },
    });
    console.log("✅ All data in hardhat deleted.");
  } catch (err) {
    console.error("❌ Failed to delete data in hardhat:", err);
  }
}
export function getApolloServerMiddleware() {
  process.on("SIGINT", async () => {
    console.log("🛑 Shutting down Apollo Server...");
    await apolloServer.stop();
    await deleteAllHardhatData(prisma);
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
