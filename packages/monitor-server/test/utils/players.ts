import { ethers, HDNodeWallet, Mnemonic } from "ethers";

export default function getPlayers() {
  const rpc = process.env.RPC_URL;
  const provider = new ethers.JsonRpcProvider(rpc, undefined, {
    cacheTimeout: -1,
  });
  const mnemonic = Mnemonic.fromPhrase(process.env.MNEMONIC!);
  const [seller, buyer] = Array(2)
    .fill(0)
    .map((_, index) => {
      const path = `m/44'/60'/0'/0/${index}`;
      const wallet = HDNodeWallet.fromMnemonic(mnemonic, path);
      return wallet.connect(provider);
    });
  return {
    seller,
    buyer,
  };
}
