import { ethers } from "hardhat";
import DeployedAddresses from "@/ignition/deployments/chain-31337/deployed_addresses.json";
import {
  BasicNFT__factory,
  NftMarketplace__factory,
  WETH9__factory,
} from "@/typechain-types";
import { mintAndList } from "./utils/MintAndList";
async function main() {
  const basicNFT = BasicNFT__factory.connect(
    DeployedAddresses["NFTMarketPlaceDev#BasicNFT"],
    (await ethers.getSigners())[0]
  );
  const market = NftMarketplace__factory.connect(
    DeployedAddresses["NFTMarketPlaceDev#NftMarketplace"],
    (await ethers.getSigners())[0]
  );
  const weth = WETH9__factory.connect(
    DeployedAddresses["NFTMarketPlaceDev#WETH9"],
    (await ethers.getSigners())[0]
  );
  const tokenId=await mintAndList(
    market,
    basicNFT,
    weth,
    ethers.parseUnits("0.3", await weth.decimals())
  );
  await market.cancelListing(basicNFT,tokenId);
}
main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    process.exit(0);
  });