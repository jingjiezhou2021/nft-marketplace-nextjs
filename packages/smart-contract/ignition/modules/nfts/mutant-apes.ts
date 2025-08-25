import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
export default buildModule("MutantApes", (m) => {
  const contract = m.contract("StandardNFT", [
    "https://boredapeyachtclub.com/api/mutants",
    "MutantApeYachtClub",
    "MAYC",
  ]);
  return { contract };
});
