import { SEPOLIA_AAVE_WETH } from '@/lib/currency';
import useUSDPrice from '@/lib/hooks/use-usd-price';
import { IconCurrencyEthereum } from '@tabler/icons-react';
import { parseEther } from 'viem';
import { sepolia } from 'viem/chains';
import { LoadingMask, LoadingSpinner } from './loading';

export default function CurrentETHRate() {
	const { data, loading } = useUSDPrice({
		erc20TokenAddress: SEPOLIA_AAVE_WETH,
		price: parseEther('1'),
		chainId: sepolia.id,
	});
	return (
		<div className="flex items-center gap-1 text-text-secondary relative">
			<LoadingMask
				className="flex justify-center items-center"
				loading={loading}
			>
				<LoadingSpinner size={12} />
			</LoadingMask>
			<IconCurrencyEthereum
				size={12}
				className="text-primary"
			/>
			<span className="leading-normal">
				<span className="font-mono">
					${parseFloat(data).toLocaleString()}
				</span>
			</span>
		</div>
	);
}
