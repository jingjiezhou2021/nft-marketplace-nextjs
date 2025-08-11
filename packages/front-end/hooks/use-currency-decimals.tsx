import { config } from '@/components/providers/RainbowKitAllProvider';
import { ChainIdParameter } from '@wagmi/core/internal';
import { erc20Abi } from 'viem';
import { useReadContract } from 'wagmi';

export default function useCurrencyDecimals(
	address: `0x${string}`,
	chainId: ChainIdParameter<typeof config>['chainId'],
) {
	const { data, isPending, error } = useReadContract({
		address,
		chainId,
		abi: erc20Abi,
		functionName: 'decimals',
	});
	return { data, isPending, error };
}
