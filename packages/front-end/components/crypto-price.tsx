import { Listing } from '@/apollo/gql/graphql';
import useCurrencyDecimals from '@/lib/hooks/use-currency-decimals';
import { getCryptoIcon, getCryptoName } from '@/lib/currency';
import { formatUnits } from 'viem';
import { config } from './providers/RainbowKitAllProvider';
import { ChainIdParameter } from '@wagmi/core/internal';
import { cn } from '@/lib/utils';
import useUSDPrice from '@/lib/hooks/use-usd-price';
import { LoadingMask, LoadingSpinner } from './loading';
import {
	CRYPTO_DISPLAY_TYPE,
	useCryptoDisplay,
} from './providers/crypto-display-provider';
import { useEffect } from 'react';
import { CircleDollarSign } from 'lucide-react';
export default function CryptoPrice({
	chainId,
	erc20TokenAddress,
	erc20TokenName,
	price,
	className,
}: Pick<Listing, 'erc20TokenAddress' | 'erc20TokenName' | 'price'> & {
	id?: string;
	className?: string;
	chainId: ChainIdParameter<typeof config>['chainId'];
}) {
	const { method } = useCryptoDisplay();
	useEffect(() => {
		console.log('crypto display method changed', method);
	}, [method]);
	const { data: decimals, isPending: currencyDecimalsPending } =
		useCurrencyDecimals(erc20TokenAddress as `0x${string}`, chainId);
	const { data: priceInUSD, loading: priceInUsdLoading } = useUSDPrice({
		erc20TokenAddress,
		price,
		chainId,
	});
	if (chainId === undefined || decimals === undefined) {
		return null;
	}
	return (
		<div
			className={cn(
				'inline-flex gap-1 text-xs relative items-center',
				method === CRYPTO_DISPLAY_TYPE.CRYPTO
					? 'flex-row'
					: 'flex-row-reverse',
				className,
			)}
		>
			<LoadingMask
				loading={priceInUsdLoading || currencyDecimalsPending}
				className="flex justify-center items-center"
			>
				<LoadingSpinner size={12} />
			</LoadingMask>
			<div
				className={cn(
					'flex',
					method === CRYPTO_DISPLAY_TYPE.USD && 'text-[10px]',
				)}
			>
				{method === CRYPTO_DISPLAY_TYPE.USD && '('}
				<div className={cn('gap-1 flex items-center')}>
					{getCryptoIcon(chainId, erc20TokenAddress)}
					<span className="font-mono font-bold">
						{formatUnits(price, decimals)}
					</span>
					{method === CRYPTO_DISPLAY_TYPE.CRYPTO && (
						<span className="text-muted-foreground font-extralight">
							{getCryptoName(chainId, erc20TokenAddress) ===
							'WETH'
								? 'ETH'
								: getCryptoName(chainId, erc20TokenAddress)}
						</span>
					)}
				</div>
				{method === CRYPTO_DISPLAY_TYPE.USD && ')'}
			</div>
			<div
				className={cn(
					method === CRYPTO_DISPLAY_TYPE.CRYPTO
						? 'text-[10px]'
						: 'text-sm gap-1',
					'flex items-center',
				)}
			>
				{method === CRYPTO_DISPLAY_TYPE.CRYPTO && '('}
				<CircleDollarSign
					size={method === CRYPTO_DISPLAY_TYPE.USD ? 14 : 12}
					className="text-muted-foreground"
				/>
				{!priceInUsdLoading && (
					<span>{parseFloat(priceInUSD).toFixed(2)}</span>
				)}
				{method === CRYPTO_DISPLAY_TYPE.CRYPTO && ')'}
			</div>
		</div>
	);
}
