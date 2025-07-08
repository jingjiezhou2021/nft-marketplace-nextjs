import { TypeChain } from "smart-contract";

export async function mintAndList(
  market: TypeChain.NftMarketplace,
  basicNFT: TypeChain.BasicNFT,
  erc20TokenContract: TypeChain.IERC20Metadata,
  price: bigint
) {
  basicNFT.mint();
  const tokenId = await new Promise<bigint>((res) => {
    basicNFT.on(basicNFT.getEvent("NFTMinted"), (_, tokenId) => {
      res(tokenId);
    });
  });
  await basicNFT.approve(market, tokenId);
  await market.listItem(basicNFT, tokenId, price, erc20TokenContract);
  return tokenId;
}
