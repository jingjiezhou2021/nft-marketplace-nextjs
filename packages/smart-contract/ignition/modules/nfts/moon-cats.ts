import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
export default buildModule("MoonCats", (m) => {
  const contract = m.contract("StandardNFT", [
    "https://api.mooncat.community/traits",
    "Acclimated​MoonCats",
    "😺",
  ]);
  return { contract };
});
