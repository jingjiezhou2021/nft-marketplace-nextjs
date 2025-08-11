import { base, hardhat, sepolia } from 'viem/chains';
import { DeployedAddresses } from 'smart-contract';
const MARKETPLACE_ADDRESS = {
	[sepolia.id]:
		DeployedAddresses[11155111]['NFTMarketPlaceProduction#NftMarketplace'],
	[hardhat.id]: DeployedAddresses[31337]['NFTMarketPlaceDev#NftMarketplace'],
	[base.id]: '',
};
export default MARKETPLACE_ADDRESS;
