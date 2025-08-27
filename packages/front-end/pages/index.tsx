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
export const getServerSideProps: GetServerSideProps<
	SSRConfig & {
		data: {
			top5CollectionsInTotalVolume: CollectionDetailProps[];
		};
	}
> = async ({ locale }) => {
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
	collectionsInfoAndData.sort((ca, cb) => {
		return cb.info.totalVolumeInUSD - ca.info.totalVolumeInUSD;
	});
	const top5CollectionsInTotalVolume = collectionsInfoAndData
		.slice(0, 5)
		.map((c) => {
			return {
				address: c.data.address as `0x${string}`,
				chainId: c.data.chainId,
			};
		});

	return {
		props: {
			...(await serverSideTranslations(locale ?? 'en', ['common'])),
			data: {
				top5CollectionsInTotalVolume,
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
				<CarouselFeaturedCollection />
			</TitleWrapper>
			<TitleWrapper title="Highest Weekly Sales">
				<HighlyWeekSales
					className="mt-4 mb-8"
					banner="/example3.avif"
					cover="/example3-1.avif"
					title="DX Terminal"
					subtitle="7d sales: 231,483"
					description="Welcome to Terminal City!\nThis collection is where each of your AI Trader NFT's will appear. Every trader is completely unique, and comes with its own PFP, an ID card that includes all their interesting personal quirks, and the animated sprite form that you'll see them walking around in in-game!"
					samples={[
						{
							image: '/example3-2.avif',
							title: 'Item #8',
							description: '0.006 ETH',
						},
						{
							image: '/example3-3.avif',
							title: 'Item #12',
							description: '0.0039 ETH',
						},
					]}
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
