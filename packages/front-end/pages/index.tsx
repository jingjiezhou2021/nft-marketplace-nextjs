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
import { SSRConfig } from 'next-i18next';
import CollectionCarouselBanner from '@/components/carousels/wrapper/collection-carousel-banner';
import { NFTDetailProps } from '@/components/nft/detail';
import { CollectionDetailProps } from '@/components/nft/collection';
import { CollectionsQuery } from '@/apollo/gql/graphql';
import { ValuesType } from 'utility-types';
import CarouselCollections from '@/components/carousels/carousel-featured-collection';
export const getServerSideProps: GetServerSideProps<
	SSRConfig & {
		data: {
			top5CollectionsInTotalVolume: CollectionDetailProps[];
			top7MostActiveCollections: CollectionDetailProps[];
			highestWeeklySaleCollection: CollectionDetailProps;
		};
	}
> = async ({ locale }) => {
	function getAllEventsOfNfts(
		nfts: ValuesType<CollectionsQuery['collections']>['importedNfts'],
	) {
		return nfts.reduce(
			(prev, cur) => {
				return prev.concat([
					...cur.itemBought,
					...cur.itemCanceled,
					...cur.itemListed,
					...cur.itemTransfered,
					...cur.offers.reduce(
						(prev, cur) => {
							const tmp: {
								createdAt: any;
								_typename?: string;
							}[] = [];
							if (cur.itemOfferMade) {
								tmp.push(cur.itemOfferMade);
							}
							if (cur.itemOfferAccepted) {
								tmp.push(cur.itemOfferAccepted);
							}
							if (cur.itemOfferCanceled) {
								tmp.push(cur.itemOfferCanceled);
							}
							return [...prev, ...tmp];
						},
						[] as { createdAt: any; __typename?: string }[],
					),
				]);
			},
			[] as { createdAt: any; __typename?: string }[],
		);
	}
	const client = createApolloClient();
	const { data: allCollections } = await client.query({
		query: findCollections,
	});
	const collectionsInfoAndData = await Promise.all(
		allCollections?.collections.map((c) => {
			return getNFTsSaleInfo({
				nfts: c.importedNfts.map((nft) => {
					return {
						contractAddress: nft.contractAddress as `0x${string}`,
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
	);
	const top5CollectionsInTotalVolume = [...collectionsInfoAndData]
		.sort((ca, cb) => {
			return cb.info.totalVolumeInUSD - ca.info.totalVolumeInUSD;
		})
		.slice(0, 5)
		.map((c) => {
			return {
				address: c.data.address as `0x${string}`,
				chainId: c.data.chainId,
			};
		});
	const top7MostActiveCollections = [...collectionsInfoAndData]
		.sort((ca, cb) => {
			return (
				getAllEventsOfNfts(cb.data.importedNfts).filter((e) => {
					const now = new Date();
					const past7Days = new Date();
					past7Days.setDate(now.getDate() - 7);
					return new Date(e.createdAt) >= past7Days;
				}).length -
				getAllEventsOfNfts(ca.data.importedNfts).filter((e) => {
					const now = new Date();
					const past7Days = new Date();
					past7Days.setDate(now.getDate() - 7);
					return new Date(e.createdAt) >= past7Days;
				}).length
			);
		})
		.slice(0, 7)
		.map((c) => {
			return {
				address: c.data.address as `0x${string}`,
				chainId: c.data.chainId,
			};
		});
	const highestWeeklySaleCollectionTmp = [...collectionsInfoAndData]
		.sort((ca, cb) => {
			return (
				getAllEventsOfNfts(cb.data.importedNfts)
					.filter((e) => {
						return e.__typename === 'NftMarketplace__ItemBought';
					})
					.filter((e) => {
						const now = new Date();
						const past7Days = new Date();
						past7Days.setDate(now.getDate() - 7);
						return new Date(e.createdAt) >= past7Days;
					}).length -
				getAllEventsOfNfts(ca.data.importedNfts)
					.filter((e) => {
						return e.__typename === 'NftMarketplace__ItemBought';
					})
					.filter((e) => {
						const now = new Date();
						const past7Days = new Date();
						past7Days.setDate(now.getDate() - 7);
						return new Date(e.createdAt) >= past7Days;
					}).length
			);
		})
		.at(0);
	const highestWeeklySaleCollection = {
		address: highestWeeklySaleCollectionTmp!.data.address as `0x${string}`,
		chainId: highestWeeklySaleCollectionTmp!.data.chainId,
	};
	return {
		props: {
			...(await serverSideTranslations(locale ?? 'en', ['common'])),
			data: {
				top5CollectionsInTotalVolume,
				top7MostActiveCollections,
				highestWeeklySaleCollection,
			},
			// data,
			// Will be passed to the page component as props
		},
	};
};
export default function Page(
	_props: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
	return (
		<div className="h-full">
			<NavInfo />
			<CollectionCarouselBanner
				collections={_props.data.top5CollectionsInTotalVolume}
			/>
			<TitleWrapper
				title="Featured Collections"
				subtitle="The week's curated collections"
			>
				<CarouselCollections
					collections={_props.data.top7MostActiveCollections}
				/>
			</TitleWrapper>
			<TitleWrapper title="Highest Weekly Sales">
				<HighlyWeekSales
					className="mt-4 mb-8"
					{..._props.data.highestWeeklySaleCollection}
				/>
			</TitleWrapper>
			<TitleWrapper
				title="Trending Collections"
				subtitle="Highest sales in the past hours"
			>
				<CarouselTrendingCollection />
			</TitleWrapper>
			<TitleWrapper
				title="NFT 101"
				subtitle="Learn about NFTs, Web3, and more."
			>
				<CarouselNFT101 />
			</TitleWrapper>
			<div className="py-12"></div>
		</div>
	);
}
