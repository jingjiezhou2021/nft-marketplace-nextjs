import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
export default buildModule("LazyLions", (m) => {
  const contract = m.contract("StandardNFT", [
    "ipfs://QmNpHFmk4GbJxDon2r2soYpwmrKaz1s6QfGMnBJtjA2ESd",
    "Lazy Lions",
    "LION",
  ]);
  return { contract };
});
