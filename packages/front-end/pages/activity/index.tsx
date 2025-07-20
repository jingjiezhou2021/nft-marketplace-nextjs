import ActivityTable from '@/components/activity-table';
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
export default function Page() {
	return (
		<div className="relative">
			<ActivityTable />
		</div>
	);
}
