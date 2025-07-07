import express from "express";
import { PrismaClient } from "./prisma/generated/prisma";
import { TypeChain } from "smart-contract";
import { ethers } from "ethers";
import { DeployedAddresses } from "smart-contract";
const prisma = new PrismaClient();
const app = express();
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
    async (seller, nftAddress, tokenId, listing,_) => {
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
        },
      });
    }
  );
}

app.listen(port, () => {
  console.log(`🚀 Express server running on http://localhost:${port}`);
  try {
    setUpEventListener();
  } catch (err) {
    console.error("❌ Error setting up event listener:", err);
  }
});
// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("🛑 Shutting down...");
  await deleteAllData();
  await prisma.$disconnect();
  process.exit();
});
