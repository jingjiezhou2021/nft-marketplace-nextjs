import { ApolloQueryResult, useQuery } from '@apollo/client';
import findItemOfferMades from '../graphql/queries/find-item-offers';
import {
	NftMarketplace__ItemOfferMadesQuery,
	QueryMode,
} from '@/apollo/gql/graphql';
import { useEffect, useState } from 'react';
import { ValuesType } from 'utility-types';
import { getNFTsSaleInfo } from './use-nfts-sale-info';
import { getUSDPrice } from '../currency';

export default function useItemOfferMades(itemOfferMadeIds: string[]) {
	const { data: itemOfferMadesData, loading: itemOfferMadesLoading } =
		useQuery(findItemOfferMades, {
			variables: {
				where: {
					OR: itemOfferMadeIds.map((id) => {
						return {
							id: {
								equals: id,
								mode: QueryMode.Insensitive,
							},
						};
					}),
				},
			},
		});
	const [calculating, setCalculating] = useState(true);
	const [data, setData] = useState<
		{
			event: ValuesType<
				ApolloQueryResult<NftMarketplace__ItemOfferMadesQuery>['data']['nftMarketplace__ItemOfferMades']
			>;
			saleInfo: Awaited<ReturnType<typeof getNFTsSaleInfo>>;
			usdPrice: number;
		}[]
	>();
	const [refetchFlag, setRefetchFlag] = useState(false);
	useEffect(() => {
		setCalculating(true);
		Promise.all(
			itemOfferMadesData?.nftMarketplace__ItemOfferMades.map(
				async (event) => {
					const saleInfo = await getNFTsSaleInfo({
						nfts: [
							{
								contractAddress: event.offer
									.nftAddress as `0x${string}`,
								tokenId: event.offer.tokenId,
								chainId: event.offer.chainId,
							},
						],
					});
					const usdPrice = await getUSDPrice({
						...event.offer.listing,
						chainId: event.offer.chainId,
					});
					return {
						event,
						usdPrice,
						saleInfo,
					};
				},
			) ?? [],
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
	}, [itemOfferMadesData, refetchFlag]);
	const refetch = () => {
		setRefetchFlag((flag) => !flag);
	};
	return {
		data,
		refetch,
		loading: calculating || itemOfferMadesLoading,
	};
}
