import { config } from '@/components/providers/RainbowKitAllProvider';
import { ChainIdParameter } from '@wagmi/core/internal';
import { useEffect, useState } from 'react';
import { erc20Abi } from 'viem';
import { useReadContract } from 'wagmi';
import { getCurrencyDecimals } from '../currency';

export default function useCurrencyDecimals(
	address?: `0x${string}`,
	chainId?: ChainIdParameter<typeof config>['chainId'],
) {
	const [data, setData] = useState<number>();
	const [isPending, setIsPending] = useState(true);
	useEffect(() => {
		if (address) {
			setIsPending(true);
			getCurrencyDecimals(address as `0x${string}`, chainId).then(
				(val) => {
					setData(val);
					setIsPending(false);
				},
			);
		}
	}, [chainId, address]);
	return { data, isPending };
}
