import { IconBaselineDensitySmall, IconFilter2 } from '@tabler/icons-react';
import { Button } from '../../ui/button';
import CustomTable from '../custom-table';
import { useEffect, useMemo, useState } from 'react';
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
import { getUSDPrice, SEPOLIA_AAVE_WETH } from '@/lib/currency';
import { useRouter } from 'next/router';
import { useSearchParams } from 'next/navigation';
import useCurrencyRate from '@/lib/hooks/use-currency-rate';
import { sepolia } from 'viem/chains';
import { formatUnits } from 'viem';
import { getRangeInUsd, Range } from '@/lib/hooks/use-range';

export default function ActivityTable() {
	const { data: events, loading: eventsLoading } = useQuery(findActivities);
	const [data, setData] = useState<Activity[]>([]);
	const [calculating, setCalculating] = useState(true);
	const searchParams = useSearchParams();
	const { data: ethRateData, decimals: ethRateDecimals } = useCurrencyRate({
		erc20TokenAddress: SEPOLIA_AAVE_WETH,
		chainId: sepolia.id,
	});
	const ethRate = useMemo(() => {
		return parseFloat(formatUnits(ethRateData?.[0] ?? 0n, ethRateDecimals));
	}, [ethRateData, ethRateDecimals]);
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
				return acts
					.sort((e1, e2) => {
						return e2.time.getTime() - e1.time.getTime();
					})
					.filter((a) => {
						const status = searchParams.get('activity-status');
						if (status !== null && status !== 'all') {
							const selectedStatus: Event[] = status
								.split(',')
								.map((s) => {
									if (s === 'Listing Canceled') {
										return Event.ListingCanceled;
									} else if (s === 'Item Offer') {
										return Event.Offer;
									} else {
										return Event[s];
									}
								});
							const ret = selectedStatus.includes(a.event);
							return ret;
						} else {
							return true;
						}
					})
					.filter((a) => {
						const chainIds = searchParams.get('chain');
						if (chainIds !== null && chainIds !== 'all') {
							const selectedChainIds: string[] =
								chainIds.split(',');
							const ret = selectedChainIds.includes(
								a.chainId?.toString() ?? '',
							);
							return ret;
						} else {
							return true;
						}
					})
					.filter((a) => {
						const priceFilter = searchParams.get('price')
							? (JSON.parse(searchParams.get('price')!) as Range<{
									currency: string;
								}>)
							: null;
						if (
							priceFilter &&
							(priceFilter.data.max || priceFilter?.data.min)
						) {
							if (a.price?.usdPrice) {
								const { min, max } = getRangeInUsd(
									priceFilter,
									ethRate,
								);
								return (
									a.price.usdPrice < max &&
									a.price.usdPrice > min
								);
							} else {
								return false;
							}
						} else {
							return true;
						}
					});
			})
			.then((acts) => {
				setCalculating(false);
				setData(acts);
			});
	}, [events, searchParams, ethRate]);
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
