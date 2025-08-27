import createApolloClient from '@/apollo';
import { QueryMode } from '@/apollo/gql/graphql';
import { config } from '@/components/providers/RainbowKitAllProvider';
import { getAddressAbbreviation } from '@/lib/address';
import findCollection from '@/lib/graphql/queries/find-collection';
import { getNFTCollectionName } from '@/lib/nft';
import { useQuery } from '@apollo/client';
import { ChainIdParameter } from '@wagmi/core/internal';
import { useEffect, useState } from 'react';
export async function getCollectionName(
	address: `0x${string}`,
	chainId: ChainIdParameter<typeof config>['chainId'],
) {
	const client = createApolloClient();
	const nameOnChain = await getNFTCollectionName(address, chainId);
	const { data, error } = await client.query({
		query: findCollection,
		variables: {
			where: {
				address: {
					equals: address,
					mode: QueryMode.Insensitive,
				},
				chainId: {
					equals: chainId,
				},
			},
		},
	});
	if (error) {
		console.error(error);
		throw new Error(error.cause?.message);
	}
	return (
		data?.findFirstCollection?.nickname ??
		nameOnChain ??
		getAddressAbbreviation(address)
	);
}
export function useCollectionsNames(
	collectionsArr: {
		address: `0x${string}`;
		chainId: ChainIdParameter<typeof config>['chainId'];
	}[],
) {
	const [calculating, setCalculating] = useState(true);
	const [collectionsNames, setCollectionsNames] = useState<string[]>([]);
	useEffect(() => {
		setCalculating(true);
		Promise.all(
			collectionsArr.map((c) => {
				return getCollectionName(c.address, c.chainId);
			}),
		).then((names) => {
			setCollectionsNames(names);
			setCalculating(false);
		});
	}, [collectionsArr]);
	return {
		loading: calculating,
		data: collectionsNames,
	};
}
export default function useCollectionName(
	address: `0x${string}`,
	chainId: ChainIdParameter<typeof config>['chainId'],
) {
	const [calculating, setCalculating] = useState(true);
	const [collectionName, setCollectionName] = useState('');
	useEffect(() => {
		setCalculating(true);
		getCollectionName(address, chainId).then((res) => {
			if (res) {
				setCollectionName(res);
			}
			setCalculating(false);
		});
	}, [address, chainId]);
	return {
		name: collectionName,
		loading: calculating,
	};
}
