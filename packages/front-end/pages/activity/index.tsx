import {
	ActivityTableWrapper,
	useActivityTableSearchParamsFilterFns,
} from '@/components/tables/activity-table';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import useActivities from '@/lib/hooks/use-activities';
export const getStaticProps = async ({ locale }) => {
	return {
		props: {
			...(await serverSideTranslations(locale, ['common', 'filter'])),
			// Will be passed to the page component as props
		},
		revalidate: 60,
	};
};
export default function Page() {
	const searchParamsFilterFns = useActivityTableSearchParamsFilterFns();
	const { data, loading } = useActivities(searchParamsFilterFns);
	return (
		<ActivityTableWrapper
			data={data}
			loading={loading}
		/>
	);
}
