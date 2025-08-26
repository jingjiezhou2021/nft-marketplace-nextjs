import { Listing } from '@/apollo/gql/graphql';
import { useReadIerc2362ValueFor } from 'smart-contract/wagmi/generated';
import { CHAIN_PRICEFEED_ADDRESSES, CHAIN_PRICEFEED_ID } from '../currency';
import { bytesToHex, bytesToString, formatUnits, hexToBytes } from 'viem';
import { ChainIdParameter } from '@wagmi/core/internal';
import { config } from '@/components/providers/RainbowKitAllProvider';
import { sepolia } from 'viem/chains';
export const PRICEFEED_DECIMALS = 6;
export default function useCurrencyRate({
	erc20TokenAddress,
	chainId,
}: Pick<Listing, 'erc20TokenAddress'> & {
	chainId: ChainIdParameter<typeof config>['chainId'];
}) {
	if (chainId === undefined) {
		chainId = sepolia.id;
	}
	const priceFeedAddress = CHAIN_PRICEFEED_ADDRESSES[chainId];
	const priceFeedId = CHAIN_PRICEFEED_ID[chainId][erc20TokenAddress];
	const paddedPriceFeedId = bytesToHex(hexToBytes(priceFeedId, { size: 32 }));
	const { data, isLoading, error } = useReadIerc2362ValueFor({
		address: priceFeedAddress as `0x${string}`,
		chainId,
		args: [paddedPriceFeedId],
	});
	return {
		data,
		decimals: PRICEFEED_DECIMALS,
		loading: isLoading,
	};
}
