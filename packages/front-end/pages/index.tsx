import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import NavInfo from '@/components/nav-info';
import CarouselNFT101 from '@/components/carousels/carousel-nft-101';
import CarouselFeaturedCollection from '@/components/carousels/carousel-featured-collection';
import TitleWrapper from '@/components/title-wrapper';
import HighlyWeekSales from '@/components/highly-week-sales';
import CarouselTrendingCollection from '@/components/carousels/carousel-trending-collection';
import createApolloClient from '@/apollo';
import { findCollections } from '@/lib/graphql/queries/find-collection';
import { getNFTsSaleInfo } from '@/lib/hooks/use-nfts-sale-info';
import { SSRConfig, useTranslation } from 'next-i18next';
import CollectionCarouselBanner from '@/components/carousels/wrapper/collection-carousel-banner';
import { NFTDetailProps } from '@/components/nft/detail';
import { CollectionDetailProps } from '@/components/nft/collection';
import { CollectionsQuery } from '@/apollo/gql/graphql';
import { ValuesType } from 'utility-types';
import CarouselCollections from '@/components/carousels/carousel-featured-collection';
import CarouselTrendingCollections from '@/components/carousels/carousel-trending-collection';
import { cn } from '@/lib/utils';
import { useQuery } from '@apollo/client';
import { useCollectionsSaleInfo } from '@/lib/hooks/use-collection-sale-info';
import { useEffect, useState } from 'react';
import { LoadingMask, LoadingSpinner } from '@/components/loading';
import { getAllEventsOfNfts } from '@/lib/nft';
export const getServerSideProps: GetServerSideProps<SSRConfig> = async ({
	locale,
}) => {
	return {
		props: {
			...(await serverSideTranslations(locale ?? 'en', ['common'])),
			// data,
			// Will be passed to the page component as props
		},
	};
};
export default function Page(
	_props: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
	const { t } = useTranslation('common');
	const { data: allCollections, loading: allCollectionsLoading } =
		useQuery(findCollections);
	const [refetchFlag, setRefetchFlag] = useState(false);
	const [data, setData] = useState<{
		top5CollectionsInTotalVolume: CollectionDetailProps[];
		top7MostActiveCollections: CollectionDetailProps[];
		highestWeeklySaleCollection: CollectionDetailProps;
		top10WeeklySaleCollections: CollectionDetailProps[];
	}>();
	const [calculating, setCalculating] = useState(true);
	useEffect(() => {
		if (allCollections) {
			setCalculating(true);
			Promise.all(
				allCollections?.collections.map((c) => {
					return getNFTsSaleInfo({
						nfts: c.importedNfts.map((nft) => {
							return {
								contractAddress:
									nft.contractAddress as `0x${string}`,
								tokenId: nft.tokenId,
								chainId: nft.collection.chainId,
							};
						}),
					}).then((info) => {
						return {
							data: c,
							info,
						};
					});
				}) ?? [],
			)
				.then((collectionsInfoAndData) => {
					const top5CollectionsInTotalVolume = [
						...collectionsInfoAndData,
					]
						.sort((ca, cb) => {
							return (
								cb.info.totalVolumeInUSD -
								ca.info.totalVolumeInUSD
							);
						})
						.slice(0, 5)
						.map((c) => {
							return {
								address: c.data.address as `0x${string}`,
								chainId: c.data.chainId,
							};
						});
					const top7MostActiveCollections = [
						...collectionsInfoAndData,
					]
						.sort((ca, cb) => {
							return (
								getAllEventsOfNfts(cb.data.importedNfts).filter(
									(e) => {
										const now = new Date();
										const past7Days = new Date();
										past7Days.setDate(now.getDate() - 7);
										return (
											new Date(e.createdAt) >= past7Days
										);
									},
								).length -
								getAllEventsOfNfts(ca.data.importedNfts).filter(
									(e) => {
										const now = new Date();
										const past7Days = new Date();
										past7Days.setDate(now.getDate() - 7);
										return (
											new Date(e.createdAt) >= past7Days
										);
									},
								).length
							);
						})
						.slice(0, 7)
						.map((c) => {
							return {
								address: c.data.address as `0x${string}`,
								chainId: c.data.chainId,
							};
						});
					const collectionsSortedInWeeklySale = [
						...collectionsInfoAndData,
					].sort((ca, cb) => {
						return (
							getAllEventsOfNfts(cb.data.importedNfts)
								.filter((e) => {
									return (
										e.__typename ===
										'NftMarketplace__ItemBought'
									);
								})
								.filter((e) => {
									const now = new Date();
									const past7Days = new Date();
									past7Days.setDate(now.getDate() - 7);
									return new Date(e.createdAt) >= past7Days;
								}).length -
							getAllEventsOfNfts(ca.data.importedNfts)
								.filter((e) => {
									return (
										e.__typename ===
										'NftMarketplace__ItemBought'
									);
								})
								.filter((e) => {
									const now = new Date();
									const past7Days = new Date();
									past7Days.setDate(now.getDate() - 7);
									return new Date(e.createdAt) >= past7Days;
								}).length
						);
					});
					const top10WeeklySaleCollections =
						collectionsSortedInWeeklySale.slice(0, 10).map((c) => {
							return {
								address: c.data.address as `0x${string}`,
								chainId: c.data.chainId,
							};
						});
					const highestWeeklySaleCollection = {
						address: collectionsSortedInWeeklySale.at(0)!.data
							.address as `0x${string}`,
						chainId:
							collectionsSortedInWeeklySale.at(0)!.data.chainId,
					};
					setData({
						top5CollectionsInTotalVolume,
						top10WeeklySaleCollections,
						top7MostActiveCollections,
						highestWeeklySaleCollection,
					});
					setCalculating(false);
				})
				.catch(() => {
					setTimeout(() => {
						setRefetchFlag((flag) => !flag);
					}, 5000);
				});
		}
	}, [allCollections, refetchFlag]);
	return (
		<div className="relative">
			<LoadingMask
				loading={calculating || allCollectionsLoading}
				className="z-30 top-0 flex justify-center"
			>
				<LoadingSpinner
					size={48}
					className="mt-[30svh]"
				/>
			</LoadingMask>
			<NavInfo />
			<CollectionCarouselBanner
				collections={data?.top5CollectionsInTotalVolume ?? []}
			/>
			<TitleWrapper
				title={t('Featured Collections')}
				subtitle={t("The week's curated collections")}
			>
				<CarouselCollections
					collections={data?.top7MostActiveCollections ?? []}
				/>
			</TitleWrapper>
			<TitleWrapper title={t('Highest Weekly Sales')}>
				<HighlyWeekSales
					className="mt-4 mb-8"
					{...(data?.highestWeeklySaleCollection ?? {
						address: '0x000000000',
						chainId: 11155111,
					})}
				/>
			</TitleWrapper>
			<TitleWrapper
				title={t('Trending Collections')}
				subtitle={t('Highest sales in the past hours')}
			>
				<CarouselTrendingCollections
					collections={data?.top10WeeklySaleCollections ?? []}
				/>
			</TitleWrapper>
			<TitleWrapper
				title={t('NFT 101')}
				subtitle={t('Learn about NFTs, Web3, and more')}
			>
				<CarouselNFT101 />
			</TitleWrapper>
			<div className="py-12"></div>
		</div>
	);
}
