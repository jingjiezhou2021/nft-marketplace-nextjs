import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("NFTMarketPlaceProduction", (m) => {
  const NFTMarketPlace = m.contract("NftMarketplace", [process.env.SEPOLIA_WETH_ADDRESS!]);
  return { NFTMarketPlace };
});
