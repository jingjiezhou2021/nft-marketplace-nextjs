import { InferGetStaticPropsType } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import createApolloClient from '@/apollo';
import { graphql } from '@/apollo/gql/gql';
import NavInfo from '@/components/nav-info';
import CarouselMain from '@/components/carousel-main';
import Image from 'next/image';
import CarouselBanner from '@/components/carousel-banner';

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
						nftExamples: [
							'/example1-1.avif',
							'/example1-2.avif',
							'/example1-3.avif',
						],
					},
					{
						banner: '/example1.avif',
						nftExamples: [
							'/example1-1.avif',
							'/example1-2.avif',
							'/example1-3.avif',
						],
					},
					{
						banner: '/example1.avif',
						nftExamples: [
							'/example1-1.avif',
							'/example1-2.avif',
							'/example1-3.avif',
						],
					},
					{
						banner: '/example1.avif',
						nftExamples: [
							'/example1-1.avif',
							'/example1-2.avif',
							'/example1-3.avif',
						],
					},
					{
						banner: '/example1.avif',
						nftExamples: [
							'/example1-1.avif',
							'/example1-2.avif',
							'/example1-3.avif',
						],
					},
				]}
			/>
		</div>
	);
}
