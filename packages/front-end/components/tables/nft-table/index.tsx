import CustomTable from '../custom-table';
import {
	IconBaselineDensitySmall,
	IconFilter2,
	IconMedal,
	IconStar,
} from '@tabler/icons-react';
import { produce } from 'immer';
import { useEffect, useState } from 'react';
import { Button } from '../../ui/button';
import GetNFTColumns, { NFT } from './columns';
import NFTTableFilterContent from './filter';
import { useTranslation } from 'next-i18next';
import { Filter } from '@/components/filter';
import { FilterTags } from '@/components/filter/tag';
import { useQuery } from '@apollo/client';
import { findCollections } from '@/lib/graphql/queries/find-collection';
import { getNFTsSaleInfo } from '@/lib/hooks/use-nfts-sale-info';
import EmojiAvatar from '@/components/emojo-avatar';
import { getCollectionName } from '@/lib/hooks/use-collection-name';
import { getAllEventsOfNfts, getOwnersOfNfts } from '@/lib/nft';
import { LoadingMask, LoadingSpinner } from '@/components/loading';
import { useRouter } from 'next/router';

export default function NFTTable() {
	const { data: collectionsData, loading: collectionsDataLoading } =
		useQuery(findCollections);
	const { i18n } = useTranslation('common');
	const [calculating, setCalculating] = useState(true);
	const [refetchFlag, setRefetchFlag] = useState(false);
	const router = useRouter();
	useEffect(() => {
		if (collectionsData) {
			setCalculating(true);
			Promise.all(
				collectionsData?.collections.map((c) => {
					return getNFTsSaleInfo({
						nfts: c.importedNfts.map((nft) => {
							return {
								contractAddress:
									nft.contractAddress as `0x${string}`,
								tokenId: nft.tokenId,
								chainId: nft.collection.chainId,
							};
						}),
					})
						.then((info) => {
							return {
								data: c,
								info,
							};
						})
						.then((infoAndData) => {
							return getCollectionName(
								infoAndData.data.address as `0x${string}`,
								infoAndData.data.chainId,
							).then((name) => {
								return {
									...infoAndData,
									collectionName: name,
								};
							});
						});
				}) ?? [],
			)
				.then((collectionsInfoAndData) => {
					setCalculating(false);
					setData(
						collectionsInfoAndData.map((item, index) => {
							return {
								id: index,
								address: item.data.address,
								cover: item.data.avatar ? (
									new URL(
										item.data.avatar,
										process.env.NEXT_PUBLIC_SERVER_ENDPOINT,
									).toString()
								) : (
									<EmojiAvatar
										address={item.data.address}
										className="size-full"
									/>
								),
								name: item.collectionName,
								floorPrice: item.info.floorSaleListing,
								topOffer: item.info.topOfferListing,
								volume: item.info.totalVolumeInUSD,
								sales: getAllEventsOfNfts(
									item.data.importedNfts,
								).filter((e) => {
									return (
										e.__typename ===
										'NftMarketplace__ItemBought'
									);
								}).length,
								owners: getOwnersOfNfts(item.data.importedNfts)
									.length,
								supply: item.data.importedNfts.length,
								watched: false,
								chainId: item.data.chainId,
							};
						}),
					);
				})
				.catch(() => {
					setTimeout(() => {
						setRefetchFlag((flag) => !flag);
					}, 5000);
				});
		}
	}, [refetchFlag, collectionsData]);
	const { t } = useTranslation('common');
	const [data, setData] = useState<NFT[]>([]);
	const [compact, setCompact] = useState<boolean>(false);
	const columns = GetNFTColumns(compact, (row) => {
		const nextData = produce(data, (draft) => {
			const target = draft.find((d) => {
				return d.id === row.original.id;
			});
			if (target !== undefined) {
				target.watched = !target.watched;
			}
			return draft;
		});
		setData(nextData);
	});
	return (
		<div className="relative flex flex-col h-full">
			<LoadingMask
				loading={collectionsDataLoading || calculating}
				className="flex justify-center items-center"
			>
				<LoadingSpinner size={64} />
			</LoadingMask>
			<div>
				<nav className="flex items-center mb-4 justify-between">
					<div className="flex gap-2">
						<Filter>
							<NFTTableFilterContent />
						</Filter>
						<Button variant="outline">
							<IconMedal /> {t('Top')}
						</Button>
						<Button variant="outline">
							<IconStar /> {t('Watchlist')}
						</Button>
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
				<FilterTags />
			</div>
			<CustomTable
				columns={columns}
				data={data}
				columnPinningState={{
					left: ['watchlist', 'name'],
				}}
				rowCursor
				onRowClick={(row) => {
					router.push(
						`/nft/${row.original.chainId}/${row.original.address}`,
						undefined,
						{ locale: i18n.language },
					);
				}}
				className="grow min-h-0 overflow-y-auto pb-4"
			/>
		</div>
	);
}
