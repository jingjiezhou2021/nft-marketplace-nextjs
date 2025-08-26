import { IconGasStation } from '@tabler/icons-react';
import { sepolia } from 'viem/chains';
import { useGasPrice } from 'wagmi';
import { LoadingMask, LoadingSpinner } from './loading';
import { formatGwei } from 'viem';

export default function CurrentGasPrice() {
	const { data, isLoading } = useGasPrice({
		chainId: sepolia.id,
	});
	const gweiInFloat = parseFloat(formatGwei(data ?? 0n));
	let gweiDisp: number;
	if (gweiInFloat > 1) {
		gweiDisp = Math.round(gweiInFloat * 1e2) / 1e2;
	} else {
		gweiDisp = Math.round(gweiInFloat * 1e3) / 1e3;
	}
	return (
		<div className="flex items-center gap-1 text-text-secondary relative">
			<LoadingMask
				loading={isLoading}
				className="flex justify-center items-center"
			>
				<LoadingSpinner size={12} />
			</LoadingMask>
			<IconGasStation
				size={12}
				className="text-primary"
			/>
			<span className="leading-normal">
				<span className="font-mono">{gweiDisp}</span> GWEI
			</span>
		</div>
	);
}
