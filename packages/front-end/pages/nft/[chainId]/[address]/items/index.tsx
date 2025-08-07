import CollectionLayout from '@/components/nft/collection/layout';
import { NextPageWithLayout } from '@/pages/_app';
import { GetServerSideProps, InferGetStaticPropsType } from 'next';
import { SSRConfig } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getServerSideProps: GetServerSideProps<SSRConfig> = async ({
	locale,
}) => {
	return {
		props: {
			...(await serverSideTranslations(locale!, ['common'])),
			// Will be passed to the page component as props
		},
	};
};
const Page: NextPageWithLayout = (
	_props: Awaited<InferGetStaticPropsType<typeof getServerSideProps>>,
) => {
	return <></>;
};
Page.GetLayout = CollectionLayout;
export default Page;
