import { base, hardhat, sepolia } from 'viem/chains';

const MARKETPLACE_ADDRESS = {
	[sepolia.id]: '0x74F561EAbFAe36c4a470667C2231dE580E14131F',
	[hardhat.id]: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
	[base.id]: '',
};
export default MARKETPLACE_ADDRESS;
