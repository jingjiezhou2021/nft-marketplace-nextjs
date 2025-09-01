import CustomTable from '../custom-table';
import {
	IconBaselineDensitySmall,
	IconFilter2,
	IconMedal,
	IconStar,
} from '@tabler/icons-react';
import { produce } from 'immer';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../ui/button';
import GetNFTColumns, { NFT } from './columns';
import NFTTableFilterContent from './filter';
import { useTranslation } from 'next-i18next';
import { Filter } from '@/components/filter';
import { FilterTags } from '@/components/filter/tag';
import { useMutation, useQuery } from '@apollo/client';
import { findCollections } from '@/lib/graphql/queries/find-collection';
import { getNFTsSaleInfo } from '@/lib/hooks/use-nfts-sale-info';
import EmojiAvatar from '@/components/emojo-avatar';
import { getCollectionName } from '@/lib/hooks/use-collection-name';
import { getAllEventsOfNfts, getOwnersOfNfts } from '@/lib/nft';
import { LoadingMask, LoadingSpinner } from '@/components/loading';
import { useRouter } from 'next/router';
import { useAccount } from 'wagmi';
import { userWatchForCollection } from '@/lib/graphql/mutations/user-watch-collection';
import useUser from '@/lib/hooks/use-user';
import useMessage from 'antd/es/message/useMessage';
import Link from 'next/link';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import WalletNotConnected from '@/components/wallet-not-connected';
import useCurrencyRate from '@/lib/hooks/use-currency-rate';
import { SEPOLIA_AAVE_WETH } from '@/lib/currency';
import { sepolia } from 'viem/chains';
import { getRangeInUsd, Range } from '@/lib/hooks/use-range';
import { formatUnits } from 'viem';

export default function NFTTable() {
	const { data: collectionsData, loading: collectionsDataLoading } =
		useQuery(findCollections);
	const { i18n } = useTranslation('common');
	const { address: userAddress } = useAccount();
	const { user, refetch: refetchUser } = useUser(userAddress);
	const [addWatch] = useMutation(userWatchForCollection);
	const [messageApi, contextHolder] = useMessage();
	const [calculating, setCalculating] = useState(true);
	const [refetchFlag, setRefetchFlag] = useState(false);
	const router = useRouter();
	const { data: ethRateData, decimals: ethRateDecimals } = useCurrencyRate({
		erc20TokenAddress: SEPOLIA_AAVE_WETH,
		chainId: sepolia.id,
	});
	const ethRate = useMemo(() => {
		return parseFloat(formatUnits(ethRateData?.[0] ?? 0n, ethRateDecimals));
	}, [ethRateData, ethRateDecimals]);
	useEffect(() => {
		if (collectionsData) {
			setCalculating(true);
			Promise.all(
				collectionsData?.collections
					.filter((c) => {
						if (router.query.watchlist === 'true') {
							if (user) {
								return (
									user.watchedCollections.filter(
										(wc) =>
											wc.address === c.address &&
											wc.chainId === c.chainId,
									).length !== 0
								);
							} else {
								return false;
							}
						} else {
							return true;
						}
					})
					.map((c) => {
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
					const floorPirceFilterContent =
						typeof router.query['floor-price'] === 'string'
							? (JSON.parse(
									router.query['floor-price'],
								) as Range<{ currency: string }>)
							: null;
					const topOfferFilterContent =
						typeof router.query['top-offer'] === 'string'
							? (JSON.parse(router.query['top-offer']) as Range<{
									currency: string;
								}>)
							: null;
					const categoryFilterContent =
						typeof router.query.category === 'string'
							? router.query.category.split(',')
							: null;
					const chainFilterContent =
						typeof router.query.chain === 'string'
							? router.query.chain.split(',')
							: null;
					setCalculating(false);
					setData(
						collectionsInfoAndData
							.map((item, index) => {
								return {
									id: index,
									address: item.data.address,
									category: item.data.category,
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
									owners: getOwnersOfNfts(
										item.data.importedNfts,
									).length,
									supply: item.data.importedNfts.length,
									watched:
										!!user &&
										user.watchedCollections.filter(
											(c) =>
												c.address ===
													item.data.address &&
												c.chainId === item.data.chainId,
										).length !== 0,
									chainId: item.data.chainId,
								};
							})
							.filter((item) => {
								if (categoryFilterContent) {
									return (
										categoryFilterContent.includes('all') ||
										categoryFilterContent?.includes(
											item.category,
										)
									);
								} else {
									return true;
								}
							})
							.filter((item) => {
								if (chainFilterContent) {
									return (
										chainFilterContent.includes('all') ||
										chainFilterContent.includes(
											item.chainId.toString(),
										)
									);
								} else {
									return true;
								}
							})
							.filter((item) => {
								if (floorPirceFilterContent) {
									if (item.floorPrice) {
										const { min, max } = getRangeInUsd(
											floorPirceFilterContent,
											ethRate,
										);
										return (
											item.floorPrice.usdPrice < max &&
											item.floorPrice.usdPrice > min
										);
									} else {
										return false;
									}
								} else {
									return true;
								}
							})
							.filter((item) => {
								if (topOfferFilterContent) {
									if (item.topOffer) {
										const { min, max } = getRangeInUsd(
											topOfferFilterContent,
											ethRate,
										);
										return (
											item.topOffer.usdPrice < max &&
											item.topOffer.usdPrice > min
										);
									} else {
										return false;
									}
								} else {
									return true;
								}
							}),
					);
				})
				.catch(() => {
					setTimeout(() => {
						setRefetchFlag((flag) => !flag);
					}, 5000);
				});
		}
	}, [refetchFlag, collectionsData, user, router.query, ethRate]);
	const { t } = useTranslation('common');
	const [data, setData] = useState<NFT[]>([]);
	const [compact, setCompact] = useState<boolean>(false);
	const { openConnectModal } = useConnectModal();
	const columns = GetNFTColumns(compact, (row) => {
		if (!userAddress) {
			openConnectModal?.();
			return;
		}
		addWatch({
			variables: {
				where: {
					address: userAddress,
				},
				data: {
					watchedCollections: row.original.watched
						? {
								disconnect: [
									{
										address_chainId: {
											address: row.original.address,
											chainId: row.original.chainId,
										},
									},
								],
							}
						: {
								connect: [
									{
										address_chainId: {
											address: row.original.address,
											chainId: row.original.chainId,
										},
									},
								],
							},
				},
			},
		}).then(() => {
			messageApi.success(
				row.original.watched
					? t('Remove collection from watch list successul')
					: t('Add collection to watch list successful'),
			);
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
			refetchUser();
		});
	});
	return (
		<div className="relative flex flex-col h-full">
			{contextHolder}
			<div>
				<nav className="flex items-center mb-4 justify-between">
					<div className="flex gap-2">
						<Filter>
							<NFTTableFilterContent />
						</Filter>
						<Link href={{ query: { watchlist: false } }}>
							<Button
								variant={
									router.query.watchlist === 'false'
										? 'default'
										: 'outline'
								}
							>
								<IconMedal /> {t('Top')}
							</Button>
						</Link>
						<Link href={{ query: { watchlist: true } }}>
							<Button
								variant={
									router.query.watchlist === 'true'
										? 'default'
										: 'outline'
								}
							>
								<IconStar /> {t('Watchlist')}
							</Button>
						</Link>
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
			{router.query.watchlist === 'true' && userAddress === undefined ? (
				<WalletNotConnected />
			) : (
				<CustomTable
					columns={columns}
					data={data}
					loading={collectionsDataLoading || calculating}
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
			)}
		</div>
	);
}
