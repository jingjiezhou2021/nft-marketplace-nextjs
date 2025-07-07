import { InferGetStaticPropsType } from 'next';
import { useTranslation } from 'next-i18next';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import createApolloClient from '@/apollo';
import { graphql } from '@/apollo/gql/gql';
export const getStaticProps = async ({ locale }) => {
	const client = createApolloClient();
	const exampleQuery = graphql(`
		query ExampleQuery {
			itemListedEvents {
				id
				listing {
					erc20TokenAddress
					erc20TokenName
					price
				}
				nftAddress
				seller
				tokenId
				chainId
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
			<h1>{t('Hello, Next.js!')}</h1>
			<ConnectButton />
		</div>
	);
}
