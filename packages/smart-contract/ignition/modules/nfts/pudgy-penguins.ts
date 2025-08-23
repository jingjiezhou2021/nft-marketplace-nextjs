import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
export default buildModule("PudgyPenguins", (m) => {
  const contract = m.contract("StandardNFT", [
    "ipfs://bafybeibc5sgo2plmjkq2tzmhrn54bk3crhnc23zd2msg4ea7a4pxrkgfna",
    "PudgyPenguins",
    "PPG",
  ]);
  return { contract };
});
