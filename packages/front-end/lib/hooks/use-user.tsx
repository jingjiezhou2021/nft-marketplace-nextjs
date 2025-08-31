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
	const [data, setData] = useState<
		{
			event: ValuesType<
				ApolloQueryResult<NftMarketplace__ItemListedsQuery>['data']['nftMarketplace__ItemListeds']
			>;
			saleInfo: Awaited<ReturnType<typeof getNFTsSaleInfo>>;
			metadata: Awaited<ReturnType<typeof getNFTMetadata>>;
			usdPrice: number;
			collectionName: string;
		}[]
	>();
	const [calculating, setCalculating] = useState(true);
	const [refetchFlag, setRefetchFlag] = useState(false);
	useEffect(() => {
		if (!address) return;
		setCalculating(true);
		const client = createApolloClient();
		client
			.query({
				query: graphql(`
					query NftMarketplace__ItemListeds(
						$where: NftMarketplace__ItemListedWhereInput
					) {
						nftMarketplace__ItemListeds(where: $where) {
							id
							chainId
							createdAt
							itemBought {
								id
								createdAt
							}
							listing {
								erc20TokenAddress
								erc20TokenName
								price
							}
							nft {
								contractAddress
								collection {
									chainId
								}
								tokenId
								activeItem {
									itemListedId
								}
							}
							seller
						}
					}
				`),
				variables: {
					where: {
						seller: {
							equals: address,
							mode: QueryMode.Insensitive,
						},
					},
				},
			})
			.then((itemListeds) => {
				const promiseArr =
					itemListeds.data.nftMarketplace__ItemListeds.map(
						async (il) => {
							if (il.nft) {
								const saleInfo = await getNFTsSaleInfo({
									nfts: [
										{
											contractAddress: il.nft
												?.contractAddress as `0x${string}`,
											tokenId: il.nft?.tokenId,
											chainId: il.chainId,
										},
									],
								});
								const metadata = await getNFTMetadata(
									il.nft.contractAddress as `0x${string}`,
									il.nft.tokenId,
									il.chainId,
								);
								const collectionName = await getCollectionName(
									il.nft.contractAddress as `0x${string}`,
									il.chainId,
								);
								const usdPrice = await getUSDPrice({
									...il.listing,
									chainId: il.chainId,
								});
								return {
									saleInfo,
									event: il,
									metadata,
									usdPrice,
									collectionName,
								};
							} else {
								return null;
							}
						},
					);
				return Promise.all(promiseArr);
			})
			.then((itemListedsWithSaleInfo) =>
				itemListedsWithSaleInfo
					.filter((item) => item !== null)
					.sort(
						(i1, i2) =>
							new Date(i2?.event.createdAt).getTime() -
							new Date(i1?.event.createdAt).getTime(),
					),
			)
			.then((itemListedsWithSaleInfo) => {
				setData(itemListedsWithSaleInfo);
				setCalculating(false);
			})
			.catch(() => {
				setTimeout(() => {
					setRefetchFlag((flag) => !flag);
				}, 5000);
			});
	}, [refetchFlag, address]);
	const refetch = () => {
		setRefetchFlag((flag) => !flag);
	};
	return {
		data,
		loading: calculating,
		refetch,
	};
}
