import { ApolloQueryResult, useQuery } from '@apollo/client';
import findItemListeds from '../graphql/queries/find-item-listeds';
import {
	NftMarketplace__ItemListedsQuery,
	QueryMode,
} from '@/apollo/gql/graphql';
import { useEffect, useState } from 'react';
import { getNFTsSaleInfo } from './use-nfts-sale-info';
import { getNFTMetadata } from '../nft';
import { getCollectionName } from './use-collection-name';
import { getUSDPrice } from '../currency';
import { ValuesType } from 'utility-types';

export default function useItemListed(itemListedIds: string[]) {
	const { data: itemListeds, loading: itemListedsLoading } = useQuery(
		findItemListeds,
		{
			variables: {
				where: {
					OR: itemListedIds.map((id) => {
						return {
							id: {
								equals: id,
								mode: QueryMode.Insensitive,
							},
						};
					}),
				},
			},
		},
	);
	const [calculating, setCalculating] = useState(true);
	const [refetchFlag, setRefetchFlag] = useState(false);
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
	useEffect(() => {
		setCalculating(true);
		Promise.all(
			itemListeds?.nftMarketplace__ItemListeds.map(async (il) => {
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
			}) ?? [],
		)
			.then((itemListedsWithSaleInfo) => {
				return itemListedsWithSaleInfo
					.filter((item) => item !== null)
					.sort(
						(i1, i2) =>
							new Date(i2?.event.createdAt).getTime() -
							new Date(i1?.event.createdAt).getTime(),
					);
			})
			.then((itemListedsWithSaleInfo) => {
				setData(itemListedsWithSaleInfo);
				setCalculating(false);
			})
			.catch(() => {
				setTimeout(() => {
					setRefetchFlag((flag) => !flag);
				}, 5000);
			});
	}, [itemListeds, refetchFlag]);
	const refetch = () => {
		setRefetchFlag((flag) => !flag);
	};
	return {
		data,
		loading: calculating || itemListedsLoading,
		refetch,
	};
}
