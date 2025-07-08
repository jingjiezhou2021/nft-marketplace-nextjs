import { BasicNFT, IERC20Metadata, NftMarketplace } from "@/typechain-types";

export async function mintAndList(
  market: NftMarketplace,
  basicNFT: BasicNFT,
  erc20TokenContract: IERC20Metadata,
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
