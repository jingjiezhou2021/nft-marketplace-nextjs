import { config } from '@/components/providers/RainbowKitAllProvider';
import { getAddressAbbreviation } from '@/lib/address';
import findCollection from '@/lib/graphql/queries/find-collection';
import { getNFTCollectionName } from '@/lib/nft';
import { useQuery } from '@apollo/client';
import { ChainIdParameter } from '@wagmi/core/internal';
import { useEffect, useState } from 'react';

export default function useCollectionName(
	address: `0x${string}`,
	chainId: ChainIdParameter<typeof config>['chainId'],
) {
	const [collectionNameChain, setCollectionNameChain] = useState('');
	const [collectionNameChainLoading, setCollectionNameChainLoading] =
		useState(true);
	useEffect(() => {
		setCollectionNameChainLoading(true);
		getNFTCollectionName(address, chainId).then((res) => {
			if (res) {
				setCollectionNameChain(res);
			}
			setCollectionNameChainLoading(false);
		});
	}, [setCollectionNameChain, address, chainId]);
	const { data, loading } = useQuery(findCollection, {
		variables: {
			where: {
				address: {
					equals: address,
				},
				chainId: {
					equals: chainId,
				},
			},
		},
	});
	return {
		name:
			data?.findFirstCollection?.nickname ??
			collectionNameChain ??
			getAddressAbbreviation(address),
		loading: loading || collectionNameChainLoading,
	};
}
