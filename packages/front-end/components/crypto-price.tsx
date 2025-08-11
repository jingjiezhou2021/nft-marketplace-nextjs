import { Listing } from '@/apollo/gql/graphql';
import useCurrencyDecimals from '@/hooks/use-currency-decimals';
import { getCryptoIcon } from '@/lib/currency';
import { formatUnits } from 'viem';
import { config } from './providers/RainbowKitAllProvider';
import { ChainIdParameter } from '@wagmi/core/internal';

export default function CryptoPrice({
	chainId,
	erc20TokenAddress,
	erc20TokenName,
	price,
}: Listing & { chainId: ChainIdParameter<typeof config>['chainId'] }) {
	const { data: decimals } = useCurrencyDecimals(
		erc20TokenAddress as `0x${string}`,
		chainId,
	);
	if (chainId === undefined || decimals === undefined) {
		return null;
	}
	return (
		<div className="inline-flex gap-1 text-xs">
			{getCryptoIcon(chainId, erc20TokenAddress)}
			<span className="font-mono font-bold">
				{formatUnits(price, decimals)}
			</span>
			<span className="text-muted-foreground font-extralight">
				{erc20TokenName}
			</span>
		</div>
	);
}
