import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("NFTMarketPlaceDev", (m) => {
  const USDT = m.contract("MockUSDT");
  const WETH = m.contract("WETH9");
  const NFTMarketPlace = m.contract("NftMarketplace", [WETH]);
  const BasicNFT =m.contract("BasicNFT",["ipfs://whatever"])
  return { USDT, WETH,NFTMarketPlace,BasicNFT };
});
