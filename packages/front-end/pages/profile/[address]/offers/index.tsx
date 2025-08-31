import ProfileLayout from '@/components/profile/layout';
import { OfferTableWrapper } from '@/components/tables/offer-table';
import { useUserItemOfferMades } from '@/lib/hooks/use-user';
import { NextPageWithLayout } from '@/pages/_app';
import { GetServerSideProps } from 'next';
import { SSRConfig, useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useParams } from 'next/navigation';

export const getServerSideProps: GetServerSideProps<SSRConfig> = async ({
	locale,
}) => {
	return {
		props: {
			...(await serverSideTranslations(locale!, ['common', 'filter'])),
			// Will be passed to the page component as props
		},
	};
};

const Page: NextPageWithLayout = () => {
	const { address } = useParams<{ address: string }>();
	const { data, loading } = useUserItemOfferMades(address);
	return (
		<OfferTableWrapper
			data={data}
			loading={loading}
		/>
	);
};
Page.GetLayout = ProfileLayout;

export default Page;
