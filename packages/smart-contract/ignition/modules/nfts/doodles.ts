import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
export default buildModule("Doodles", (m) => {
  const contract = m.contract("StandardNFT", [
    "ipfs://QmPMc4tcBsMqLRuCQtPmPe84bpSjrC3Ky7t3JWuHXYB4aS",
    "Doodles",
    "DOODLE",
  ]);
  return { contract };
});
