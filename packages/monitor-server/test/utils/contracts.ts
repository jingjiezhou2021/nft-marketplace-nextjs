import { ContractRunner } from "ethers";
import { DeployedAddresses, TypeChain } from "smart-contract";
export function getBasicNFT(seller: ContractRunner) {
  return TypeChain.BasicNFT__factory.connect(
    DeployedAddresses["31337"]["NFTMarketPlaceDev#BasicNFT"],
    seller
  );
}

export function getMarket(seller: ContractRunner) {
  return TypeChain.NftMarketplace__factory.connect(
    DeployedAddresses["31337"]["NFTMarketPlaceDev#NftMarketplace"],
    seller
  );
}

export function getUsdt(seller: ContractRunner) {
  return TypeChain.MockUSDT__factory.connect(
    DeployedAddresses["31337"]["NFTMarketPlaceDev#MockUSDT"],
    seller
  );
}

export function getWeth(seller: ContractRunner) {
  return TypeChain.WETH9__factory.connect(
    DeployedAddresses["31337"]["NFTMarketPlaceDev#WETH9"],
    seller
  );
}
