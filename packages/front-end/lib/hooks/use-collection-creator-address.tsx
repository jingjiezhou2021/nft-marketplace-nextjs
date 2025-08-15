import { useEffect, useState } from 'react';
import { getNFTCollectionCreatorAddress } from '../nft';
import { ChainIdParameter } from '@wagmi/core/internal';
import { config } from '@/components/providers/RainbowKitAllProvider';

export default function useCollectionCreatorAddress(
	chainId: ChainIdParameter<typeof config>['chainId'],
	contractAddress: `0x${string}`,
) {
	const [ownerAddress, setOwnerAddress] = useState('');
	const [loading, setLoading] = useState(true);
	useEffect(() => {
		setLoading(true);
		getNFTCollectionCreatorAddress(contractAddress, chainId).then((res) => {
			if (res) {
				setLoading(false);
				setOwnerAddress(res);
			}
		});
	}, [contractAddress, chainId]);
	return { data: ownerAddress, loading };
}
