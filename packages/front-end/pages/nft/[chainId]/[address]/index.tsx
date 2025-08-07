import { GetServerSideProps, InferGetStaticPropsType } from 'next';
import { SSRConfig } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
export const getServerSideProps: GetServerSideProps<
	SSRConfig,
	{ chainId: string; address: string }
> = async ({ locale, params }) => {
	const i18n = await serverSideTranslations(locale!, ['common']);
	return {
		redirect: {
			destination: `/${i18n!._nextI18Next!.initialLocale}/nft/${params?.chainId}/${params?.address}/items`,
			permanent: true,
		},
	};
};
export default function Page(
	_props: InferGetStaticPropsType<typeof getServerSideProps>,
) {
	return <></>;
}
