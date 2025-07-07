import { ethers } from "hardhat";
import DeployedAddresses from "@/ignition/deployments/chain-31337/deployed_addresses.json";
import {
  BasicNFT__factory,
  MockUSDT__factory,
  NftMarketplace__factory,
} from "@/typechain-types";
async function main() {
  const basicNFT = BasicNFT__factory.connect(
    DeployedAddresses["NFTMarketPlaceDev#BasicNFT"],
    (await ethers.getSigners())[0]
  );
  const market = NftMarketplace__factory.connect(
    DeployedAddresses["NFTMarketPlaceDev#NftMarketplace"],
    (await ethers.getSigners())[0]
  );
  const usdt = MockUSDT__factory.connect(
    DeployedAddresses["NFTMarketPlaceDev#MockUSDT"],
    (await ethers.getSigners())[0]
  );
  basicNFT.mint();
  const tokenId = await new Promise<bigint>((res) => {
    basicNFT.on(basicNFT.getEvent("NFTMinted"), (_, tokenId) => {
      res(tokenId);
    });
  });
  await basicNFT.approve(market, tokenId);
  await market.listItem(
    basicNFT,
    tokenId,
    ethers.parseUnits("1000", await usdt.decimals()),
    usdt
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(()=>{
    process.exit(0);
})
