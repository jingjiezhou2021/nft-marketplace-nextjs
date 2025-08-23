import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
export default buildModule("Meebits", (m) => {
  const contract = m.contract("StandardNFT", [
    "https://meebits.larvalabs.com/meebit",
    "Meebits",
    "⚇",
  ]);
  return { contract };
});
