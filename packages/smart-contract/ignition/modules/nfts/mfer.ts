import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
export default buildModule("mfer", (m) => {
  const contract = m.contract("StandardNFT", [
    "ipfs://QmWiQE65tmpYzcokCheQmng2DCM33DEhjXcPB6PanwpAZo",
    "mfer",
    "MFER",
  ]);
  return { contract };
});
