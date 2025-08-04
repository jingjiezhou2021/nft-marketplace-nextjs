import { config } from '@/components/providers/RainbowKitAllProvider';
import { getNFTMetadata } from '@/lib/nft';
import { ChainIdParameter } from '@wagmi/core/internal';
import { useEffect, useState } from 'react';

export default function useNFTMetadata(
	contractAddress: `0x${string}`,
	tokenId: number,
	chainId: ChainIdParameter<typeof config>['chainId'],
) {
	const [metadata, setMetadata] =
		useState<Awaited<ReturnType<typeof getNFTMetadata>>>();
	useEffect(() => {
		getNFTMetadata(contractAddress, tokenId, chainId).then((res) => {
			setMetadata(res);
		});
	}, [contractAddress, tokenId, chainId]);
	return metadata;
}
