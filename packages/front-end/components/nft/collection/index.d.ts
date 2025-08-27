import { config } from '@/components/providers/RainbowKitAllProvider';
import { ChainIdParameter } from '@wagmi/core/internal';
export type CollectionDetailProps = {
	address: `0x${string}`;
	chainId: ChainIdParameter<typeof config>['chainId'];
};
