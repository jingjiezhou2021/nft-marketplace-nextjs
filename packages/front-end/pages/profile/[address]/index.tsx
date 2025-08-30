import { GetServerSideProps, InferGetStaticPropsType } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { SSRConfig } from 'next-i18next';
export const getServerSideProps: GetServerSideProps<SSRConfig> = async ({
	locale,
	params,
}) => {
	const i18n = await serverSideTranslations(locale!, ['common']);
	return {
		redirect: {
			destination: `/${i18n!._nextI18Next!.initialLocale}/profile/${params?.address}/nfts`,
			permanent: true,
		},
	};
};
export default function Page(
	_props: InferGetStaticPropsType<typeof getServerSideProps>,
) {
	return <></>;
}
