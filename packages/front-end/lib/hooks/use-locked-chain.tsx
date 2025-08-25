import { config } from '@/components/providers/RainbowKitAllProvider';
import { ChainIdParameter } from '@wagmi/core/internal';
import { useEffect } from 'react';
import { useChainId, useSwitchChain } from 'wagmi';

export default function useLockedChain(
	chainId: ChainIdParameter<typeof config>['chainId'],
) {
	const { switchChain } = useSwitchChain();
	const currentChainId = useChainId();
	useEffect(() => {
		if (chainId !== undefined && currentChainId !== chainId) {
			switchChain({
				chainId,
			});
		}
	}, [chainId, currentChainId, switchChain]);
}
