import CustomTable from '@/components/tables/custom-table';
import NFTTable from '@/components/tables/nft-table';
import { Button } from '@/components/ui/button';
import {
	IconBaselineDensityLarge,
	IconBaselineDensitySmall,
	IconFilter2,
	IconMedal,
	IconStar,
} from '@tabler/icons-react';
import { InferGetStaticPropsType } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
export const getStaticProps = async ({ locale }) => {
	return {
		props: {
			...(await serverSideTranslations(locale, ['common', 'filter'])),
			// Will be passed to the page component as props
		},
		revalidate: 60,
	};
};
export default function Page(
	_props: InferGetStaticPropsType<typeof getStaticProps>,
) {
	return (
		<div className="relative">
			<NFTTable />
		</div>
	);
}
