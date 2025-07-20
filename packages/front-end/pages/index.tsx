import { InferGetStaticPropsType } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import NavInfo from '@/components/nav-info';
import CarouselBanner from '@/components/carousels/carousel-banner';
import CarouselNFT101 from '@/components/carousels/carousel-nft-101';
import CarouselFeaturedCollection from '@/components/carousels/carousel-featured-collection';
import TitleWrapper from '@/components/title-wrapper';
import HighlyWeekSales from '@/components/highly-week-sales';
import CarouselTrendingCollection from '@/components/carousels/carousel-trending-collection';
export const getStaticProps = async ({ locale }) => {
	// const client = createApolloClient();
	// const exampleQuery = graphql(`
	// 	query ExampleQuery {
	// 		activeItems {
	// 			seller
	// 			nftAddress
	// 			tokenId
	// 			listing {
	// 				price
	// 				erc20TokenAddress
	// 				erc20TokenName
	// 			}
	// 		}
	// 	}
	// `);
	// const { data } = await client.query({
	// 	query: exampleQuery,
	// });
	return {
		props: {
			...(await serverSideTranslations(locale, ['common'])),
			// data,
			// Will be passed to the page component as props
		},
		revalidate: 60,
	};
};
export default function Page(
	_props: InferGetStaticPropsType<typeof getStaticProps>,
) {
	return (
		<div className="h-full">
			<NavInfo />
			<CarouselBanner
				nftBanners={[
					{
						banner: '/example1.avif',
						name: 'Creatures',
						author: 'CreatureWorld',
						nftExamples: [
							'/example1-1.avif',
							'/example1-2.avif',
							'/example1-3.avif',
						],
						floorPrice: '0.0213 ETH',
						amount: 9999n,
						totalVolume: '36.5K ETH',
						listedPercentage: 1,
					},
					{
						banner: '/example1.avif',
						name: 'Creatures',
						author: 'CreatureWorld',
						nftExamples: [
							'/example1-1.avif',
							'/example1-2.avif',
							'/example1-3.avif',
						],
						floorPrice: '0.0213 ETH',
						amount: 9999n,
						totalVolume: '36.5K ETH',
						listedPercentage: 1,
					},
				]}
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
