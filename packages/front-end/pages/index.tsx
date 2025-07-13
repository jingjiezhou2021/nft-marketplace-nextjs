import { InferGetStaticPropsType } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import createApolloClient from '@/apollo';
import { graphql } from '@/apollo/gql/gql';
import NavInfo from '@/components/nav-info';
export const getStaticProps = async ({ locale }) => {
	const client = createApolloClient();
	const exampleQuery = graphql(`
		query ExampleQuery {
			activeItems {
				seller
				nftAddress
				tokenId
				listing {
					price
					erc20TokenAddress
					erc20TokenName
				}
			}
		}
	`);
	const { data } = await client.query({
		query: exampleQuery,
	});
	return {
		props: {
			...(await serverSideTranslations(locale, ['common'])),
			data,
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
		</div>
	);
}
