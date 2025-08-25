import { Listing } from '@/apollo/gql/graphql';
import { useReadIerc2362ValueFor } from 'smart-contract/wagmi/generated';
import { CHAIN_PRICEFEED_ADDRESSES, CHAIN_PRICEFEED_ID } from '../currency';
import { bytesToHex, bytesToString, formatUnits, hexToBytes } from 'viem';
import useCurrencyDecimals from './use-currency-decimals';
import { ChainIdParameter } from '@wagmi/core/internal';
import { config } from '@/components/providers/RainbowKitAllProvider';
import { sepolia } from 'viem/chains';
const DECIMALS = 6;
export default function useUSDPrice({
	erc20TokenAddress,
	price,
	chainId,
}: Pick<Listing, 'erc20TokenAddress' | 'price'> & {
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
	const { data: tokenDecimals, isPending: tokenDecimalsLoading } =
		useCurrencyDecimals(erc20TokenAddress as `0x${string}`, chainId);
	let priceInUSD: string;
	if (data?.[0]) {
		priceInUSD = formatUnits(
			data[0] * price,
			(tokenDecimals ?? 6) + DECIMALS,
		);
	} else {
		priceInUSD = formatUnits(price, tokenDecimals ?? 6);
	}
	return {
		data: priceInUSD,
		loading: tokenDecimalsLoading || isLoading,
	};
}
