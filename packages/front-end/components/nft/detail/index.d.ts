import { config } from '@/components/providers/RainbowKitAllProvider';
import { ChainIdParameter } from '@wagmi/core/internal';
export type NFTDetailProps = {
	contractAddress: `0x${string}`;
	tokenId: number;
	chainId: ChainIdParameter<typeof config>['chainId'];
};
