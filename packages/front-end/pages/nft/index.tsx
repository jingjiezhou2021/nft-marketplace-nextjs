import CustomTable from '@/components/custom-table';
import NFTTable from '@/components/nft-table';
import { InferGetStaticPropsType } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
export const getStaticProps = async ({ locale }) => {
	return {
		props: {
			...(await serverSideTranslations(locale, ['common'])),
			// Will be passed to the page component as props
		},
		revalidate: 60,
	};
};
export default function Page(
	_props: InferGetStaticPropsType<typeof getStaticProps>,
) {
	return (
		<div>
			<NFTTable />
		</div>
	);
}
