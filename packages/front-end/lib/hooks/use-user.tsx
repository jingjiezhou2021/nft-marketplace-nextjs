import createApolloClient from '@/apollo';
import { graphql } from '@/apollo/gql';
import {
	FindFirstUserProfileQuery,
	NftMarketplace__ItemListedsQuery,
	QueryMode,
} from '@/apollo/gql/graphql';
import { getAddressAbbreviation } from '@/lib/address';
import findUserProfile from '@/lib/graphql/queries/find-user-profile';
import { ApolloQueryResult, useQuery } from '@apollo/client';
import { useEffect, useMemo, useState } from 'react';
import useNFTsSaleInfo, { getNFTsSaleInfo } from './use-nfts-sale-info';
import { ValuesType } from 'utility-types';
import { getNFTMetadata } from '../nft';
import { getCollectionName } from './use-collection-name';
import { getUSDPrice } from '../currency';
import useItemListed from './use-item-listed';
import findItemListeds from '../graphql/queries/find-item-listeds';
export async function getUser(address: string | undefined) {
	if (address === undefined) {
		return {
			user: null,
			dispName: '',
		};
	}
	const client = createApolloClient();
	const { data, error } = await client.query({
		query: findUserProfile,
		variables: {
			where: {
				address: {
					equals: address,
					mode: QueryMode.Insensitive,
				},
			},
		},
	});
	if (error) {
		console.error(error);
		throw new Error(error.cause?.message);
	}
	let dispName = data.findFirstUserProfile?.username;
	if (!dispName) {
		dispName = getAddressAbbreviation(address);
	}
	return {
		user: data.findFirstUserProfile,
		dispName,
	};
}

export function useUsers(addresses: (string | undefined)[]) {
	const [data, setData] = useState<
		{
			user: FindFirstUserProfileQuery['findFirstUserProfile'];
			dispName: string;
		}[]
	>([]);
	const [loading, setLoading] = useState(true);
	useEffect(() => {
		setLoading(true);
		Promise.all(
			addresses.map((address) => {
				return getUser(address);
			}),
		).then((data) => {
			setData(data);
			setLoading(false);
		});
	}, [addresses]);
	return {
		data,
		loading,
	};
}

export default function useUser(address: string | undefined) {
	const [user, setUser] =
		useState<FindFirstUserProfileQuery['findFirstUserProfile']>();
	const [loading, setLoading] = useState(true);
	const [refetchFlag, setRefetchFlag] = useState(false);
	let dispName = user?.username;
	if (!dispName) {
		dispName = getAddressAbbreviation(address);
	}
	useEffect(() => {
		setLoading(true);
		getUser(address).then((data) => {
			setUser(data.user);
			setLoading(false);
		});
	}, [address, refetchFlag]);
	const refetch = () => {
		setRefetchFlag((flag) => !flag);
	};
	return {
		user,
		dispName,
		loading,
		refetch,
	};
}

export function useUserListings(address: string | undefined) {
	const { data: itemListeds, loading: itemListedsLoading } = useQuery(
		findItemListeds,
		{
			variables: {
				where: {
					seller: {
						equals: address,
						mode: QueryMode.Insensitive,
					},
				},
			},
		},
	);
	const { data, refetch, loading } = useItemListed(
		itemListeds?.nftMarketplace__ItemListeds.map((il) => il.id) ?? [],
	);
	return {
		data,
		loading: itemListedsLoading || loading,
		refetch,
	};
}
