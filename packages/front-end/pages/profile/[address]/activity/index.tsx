import ProfileLayout from '@/components/profile/layout';
import {
	ActivityTableWrapper,
	useActivityTableSearchParamsFilterFns,
} from '@/components/tables/activity-table';
import useActivities from '@/lib/hooks/use-activities';
import { NextPageWithLayout } from '@/pages/_app';
import { GetServerSideProps } from 'next';
import { SSRConfig } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';
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
	const searchParamsFilterFns = useActivityTableSearchParamsFilterFns();
	const { address } = useParams<{ address?: string }>();
	const filterFns = useMemo(() => {
		return [
			...searchParamsFilterFns,
			(a) => {
				if (address) {
					return (
						a.from?.toLowerCase() === address.toLowerCase() ||
						a.to?.toLowerCase() === address.toLowerCase()
					);
				} else {
					return false;
				}
			},
		];
	}, [address, searchParamsFilterFns]);
	const { data, loading } = useActivities(filterFns);
	return (
		<ActivityTableWrapper
			className="h-auto"
			data={data}
			loading={loading}
		/>
	);
};
Page.GetLayout = ProfileLayout;
export default Page;
