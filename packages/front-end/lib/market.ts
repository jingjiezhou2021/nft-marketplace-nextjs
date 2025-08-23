import { baseSepolia, sepolia } from 'viem/chains';
import { DeployedAddresses } from 'smart-contract';
const MARKETPLACE_ADDRESS = {
	[sepolia.id]:
		DeployedAddresses[11155111]['NFTMarketPlaceProduction#NftMarketplace'],
	[baseSepolia.id]:
		DeployedAddresses[84532]['NFTMarketPlaceProduction#NftMarketplace'],
};
export default MARKETPLACE_ADDRESS;
