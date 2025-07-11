import { InferGetStaticPropsType } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import createApolloClient from '@/apollo';
import { graphql } from '@/apollo/gql/gql';
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
	const { t } = useTranslation('common');
	return (
		<div>
			<h1>{t('this is home page')}</h1>
		</div>
	);
}
