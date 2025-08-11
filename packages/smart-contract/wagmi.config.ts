import { defineConfig } from "@wagmi/cli";
import { hardhat, react } from "@wagmi/cli/plugins";

export default defineConfig({
  out: "wagmi/generated.ts",
  contracts: [],
  plugins: [
    hardhat({
      project: ".",
    }),
    react(),
  ],
});
