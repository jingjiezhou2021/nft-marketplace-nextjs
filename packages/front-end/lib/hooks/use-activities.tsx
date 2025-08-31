import { useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import findActivities from '../graphql/queries/find-activities';
import { getNFTMetadata } from '../nft';
import { getCollectionName } from './use-collection-name';
import { getUSDPrice } from '../currency';
import { Activity } from '@/components/tables/activity-table/columns';
import { EventTypenameToEvent } from '@/components/filter/selection/activity-selection';

export default function useActivities(
	filterFns?: ((act: Activity) => boolean)[],
) {
	const { data: events, loading: eventsLoading } = useQuery(findActivities);
	const [data, setData] = useState<Activity[]>([]);
	const [calculating, setCalculating] = useState(true);
	useEffect(() => {
		setCalculating(true);
		Promise.all(
			[
				...(events?.nftMarketplace__ItemBoughts ?? []).map((event) => {
					return {
						nftRelated: event.nft,
						event: event,
						from: event.seller,
						to: event.buyer,
						price: event.listing,
					};
				}),
				...(events?.nftMarketplace__ItemCanceleds ?? []).map(
					(event) => {
						return {
							nftRelated: event.nft,
							event: event,
							from: event.seller,
							to: null,
							price: event.listing,
						};
					},
				),
				...(events?.nftMarketplace__ItemListeds ?? []).map((event) => {
					return {
						nftRelated: event.nft,
						event: event,
						from: event.seller,
						to: null,
						price: event.listing,
					};
				}),
				...(events?.nftMarketplace__ItemOfferMades ?? []).map(
					(event) => {
						return {
							nftRelated: event.offer.nft,
							event: event,
							from: event.offer.buyer,
							to: event.seller,
							price: event.offer.listing,
						};
					},
				),
				...(events?.nftMarketplace__ItemTransfereds ?? []).map(
					(event) => {
						return {
							nftRelated: event.nft,
							event: event,
							from: event.sender,
							to: event.receiver,
							price: null,
						};
					},
				),
			].map(async (item) => {
				if (item.nftRelated) {
					const metadata = await getNFTMetadata(
						item.nftRelated.contractAddress as `0x${string}`,
						item.nftRelated?.tokenId,
						item.nftRelated?.collection.chainId,
					);
					const collectionName = await getCollectionName(
						item.nftRelated!.contractAddress as `0x${string}`,
						item.nftRelated!.collection.chainId,
					);
					let usdPrice: number = 0;
					if (item.price !== null) {
						usdPrice = await getUSDPrice({
							...item.price,
							chainId: item.nftRelated.collection.chainId,
						});
					}
					const retItem: Activity = {
						event: EventTypenameToEvent(item.event.__typename!)!,
						item: {
							cover: metadata.image,
							name: metadata.dispName,
							collectionName,
						},
						from: item.from,
						to: item.to,
						price: item.price
							? {
									...item.price,
									chainId: item.event.chainId,
									usdPrice,
								}
							: null,
						time: new Date(item.event.createdAt),
						nftAddress: item.nftRelated
							.contractAddress as `0x${string}`,
						chainId: item.event.chainId,
						tokenId: item.nftRelated.tokenId,
					};
					return retItem;
				} else {
					return null;
				}
			}),
		)
			.then((acts) => {
				return acts.filter((item) => item !== null);
			})
			.then((acts) => {
				let ret = acts;
				filterFns?.forEach((filterFn) => {
					ret = ret.filter(filterFn);
				});
				ret.sort((e1, e2) => {
					return e2.time.getTime() - e1.time.getTime();
				});
				return ret;
			})
			.then((acts) => {
				setData(acts);
				setCalculating(false);
			});
	}, [events, filterFns]);
	return {
		data,
		loading: calculating || eventsLoading,
	};
}
