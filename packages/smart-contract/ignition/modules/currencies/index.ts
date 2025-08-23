import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("Currencies", (m) => {
  const USDT = m.contract("MockUSDT");
  const WETH = m.contract("WETH9");
  return { USDT, WETH };
});
