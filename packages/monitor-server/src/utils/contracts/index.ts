import { ethers } from "ethers";
import { DeployedAddresses, TypeChain } from "smart-contract";

export const CHAIN_RPC_URL: Record<number, string> = {
  [31337]: "http://localhost:8545",
  [11155111]: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  [84532]: `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
};
export function getProviderOfChain(chainId: number) {
  const rpc = CHAIN_RPC_URL[chainId];
  const provider = new ethers.JsonRpcProvider(rpc, undefined, {
    cacheTimeout: -1,
  });
  return provider;
}
export function getMarketContractOfChain(
  chainId: number
): TypeChain.contracts.nftMarketPlaceSol.NftMarketplace | null {
  const provider = getProviderOfChain(chainId);
  const marketAddress =
    (DeployedAddresses as any)[chainId.toString()]?.[
      "NFTMarketPlaceDev#NftMarketplace"
    ] ??
    (DeployedAddresses as any)[chainId.toString()]?.[
      "NFTMarketPlaceProduction#NftMarketplace"
    ];
  if (marketAddress) {
    const marketContract = TypeChain.NftMarketplace__factory.connect(
      marketAddress,
      provider
    );
    return marketContract;
  } else {
    return null;
  }
}
