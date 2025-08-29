import { IconBaselineDensitySmall, IconFilter2 } from '@tabler/icons-react';
import { Button } from '../../ui/button';
import CustomTable from '../custom-table';
import { useEffect, useState } from 'react';
import GetActivityColumns, { Activity, Event } from './columns';
import ActivityFilterContent from './filter';
import { Filter } from '@/components/filter';
import FilterTag, { FilterTags } from '@/components/filter/tag';
import { LoadingMask, LoadingSpinner } from '@/components/loading';
import useMessage from 'antd/es/message/useMessage';
import { from, useQuery } from '@apollo/client';
import findActivities from '@/lib/graphql/queries/find-activities';
import { getNFTMetadata } from '@/lib/nft';
import { getCollectionName } from '@/lib/hooks/use-collection-name';
import { EventTypenameToEvent } from '@/components/filter/selection/activity-selection';
import { getUSDPrice } from '@/lib/currency';

export default function ActivityTable() {
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
						from: event.nft?.contractAddress,
						to: event.seller,
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
				acts.sort((e1, e2) => {
					return e2.time.getTime() - e1.time.getTime();
				});
				setCalculating(false);
				setData(acts);
			});
	}, [events]);
	const [compact, setCompact] = useState<boolean>(false);
	const columns = GetActivityColumns(compact);
	return (
		<div className="relative flex flex-col h-full">
			<LoadingMask
				loading={calculating || eventsLoading}
				className="flex justify-center items-center z-30"
			>
				<LoadingSpinner size={64} />
			</LoadingMask>
			<div>
				<nav className="flex items-center mb-4 justify-between">
					<div className="flex gap-2">
						<Filter>
							<ActivityFilterContent />
						</Filter>
					</div>
					<div>
						<Button
							variant={compact ? 'default' : 'outline'}
							onClick={() => {
								setCompact(!compact);
							}}
							className="hidden md:inline-flex"
						>
							<IconBaselineDensitySmall />
						</Button>
					</div>
				</nav>
				<FilterTags></FilterTags>
			</div>
			<CustomTable
				columns={columns}
				data={data}
				columnPinningState={{
					left: ['event', 'item'],
				}}
				rowCursor={false}
				className="grow min-h-0 overflow-y-auto pb-4"
			/>
		</div>
	);
}
