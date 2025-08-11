import { ethers } from "ethers";
import { TypeChain, DeployedAddresses } from "smart-contract";
import listenForItemListed from "./item-listed";
import listenForItemCanceled from "./item-canceled";
import listenForItemBought from "./item-bought";
import listenForItemOfferMade from "./item-offer-made";
const CHAIN_RPC_URL = {
  [31337]: "http://localhost:8545",
  [11155111]: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  [84532]: `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
};
export async function setUpEventListener() {
  for (const chainId in CHAIN_RPC_URL) {
    setUpEventListenerOnChain(parseInt(chainId));
  }
}
async function setUpEventListenerOnChain(chainId: number) {
  console.log("starting to listen on chain", chainId);
  const rpc = CHAIN_RPC_URL[chainId];
  const provider = new ethers.JsonRpcProvider(rpc, undefined, {
    cacheTimeout: -1,
  });
  const marketAddress =
    DeployedAddresses[chainId.toString()]?.[
      "NFTMarketPlaceDev#NftMarketplace"
    ] ??
    DeployedAddresses[chainId.toString()]?.["NFTMarketPlaceProduction#NftMarketplace"];
  if (marketAddress) {
    const marketContract = TypeChain.NftMarketplace__factory.connect(
      marketAddress,
      provider
    );
    listenForItemListed(marketContract, BigInt(chainId));
    listenForItemCanceled(marketContract, BigInt(chainId));
    listenForItemBought(marketContract, BigInt(chainId));
    listenForItemOfferMade(marketContract, BigInt(chainId));
    console.log("listener set successful on chain", chainId);
  }
}
