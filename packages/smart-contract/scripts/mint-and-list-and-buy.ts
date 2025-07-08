import { ethers } from "hardhat";
import DeployedAddresses from "@/ignition/deployments/chain-31337/deployed_addresses.json";
import {
  BasicNFT__factory,
  MockUSDT__factory,
  NftMarketplace__factory,
  WETH9__factory,
} from "@/typechain-types";
import { mintAndList } from "./utils/MintAndList";
async function main() {
  const seller = (await ethers.getSigners())[0];
  const buyer = (await ethers.getSigners())[1];
  const basicNFT = BasicNFT__factory.connect(
    DeployedAddresses["NFTMarketPlaceDev#BasicNFT"],
    seller
  );
  const market = NftMarketplace__factory.connect(
    DeployedAddresses["NFTMarketPlaceDev#NftMarketplace"],
    seller
  );
  const usdt = MockUSDT__factory.connect(
    DeployedAddresses["NFTMarketPlaceDev#MockUSDT"],
    seller
  );
  const weth = WETH9__factory.connect(
    DeployedAddresses["NFTMarketPlaceDev#WETH9"],
    seller
  );
  const priceUSDT = ethers.parseUnits("1200", await usdt.decimals());
  const priceWETH = ethers.parseUnits("0.4", await weth.decimals());
  await weth.connect(buyer).deposit({ value: ethers.parseEther("1") });
  await usdt.connect(buyer).mint(priceUSDT);
  const tokenIdUSDT = await mintAndList(market, basicNFT, usdt, priceUSDT);
  const tokenIdWETH = await mintAndList(market, basicNFT, weth, priceWETH);
  await usdt.connect(buyer).approve(market, priceUSDT);
  await weth.connect(buyer).approve(market, priceWETH);
  await market.connect(buyer).buyItem(seller, basicNFT, tokenIdUSDT);
  await market
    .connect(buyer)
    .buyItem(seller, basicNFT, tokenIdWETH, { value: priceWETH });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    process.exit(0);
  });
