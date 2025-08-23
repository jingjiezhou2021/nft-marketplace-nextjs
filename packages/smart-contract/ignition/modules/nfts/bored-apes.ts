import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
export default buildModule("BoredApes", (m) => {
  const contract = m.contract("StandardNFT", [
    "ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq",
    "BoredApeYachtClub",
    "BAYC",
  ]);
  return { contract };
});
