import { Filter, FilterContent } from '@/components/filter';
import { PRICE, PriceRange } from '@/components/filter/range/price-range';
import { ActivitySelection } from '@/components/filter/selection/activity-selection';
import CollectionLayout from '@/components/nft/collection/layout';
import { config } from '@/components/providers/RainbowKitAllProvider';
import {
	ActivityTableWrapper,
	useActivityTableSearchParamsFilterFns,
} from '@/components/tables/activity-table';
import { Activity } from '@/components/tables/activity-table/columns';
import useActivities from '@/lib/hooks/use-activities';
import { NextPageWithLayout } from '@/pages/_app';
import { ChainIdParameter } from '@wagmi/core/internal';
import { GetServerSideProps, InferGetStaticPropsType } from 'next';
import { SSRConfig, useTranslation } from 'next-i18next';
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
const Page: NextPageWithLayout = (
	_props: Awaited<InferGetStaticPropsType<typeof getServerSideProps>>,
) => {
	const searchParamsFilterFns = useActivityTableSearchParamsFilterFns();
	const params = useParams<{ address: string; chainId: string }>();
	const chainId = parseInt(params.chainId) as ChainIdParameter<
		typeof config
	>['chainId'];
	const address = params.address as `0x${string}`;
	const filterFns = useMemo(() => {
		return [
			...searchParamsFilterFns,
			(a: Activity) => {
				if (address) {
					return (
						a.nftAddress.toLowerCase() === address.toLowerCase() &&
						a.chainId === chainId
					);
				} else {
					return false;
				}
			},
		];
	}, [address, searchParamsFilterFns, chainId]);
	const { data, loading } = useActivities(filterFns);
	const { t } = useTranslation('common');
	return (
		<ActivityTableWrapper
			data={data}
			loading={loading}
			className="h-auto"
			slots={{
				filter: (
					<Filter>
						<FilterContent>
							<h4>{t('Status')}</h4>
							<ActivitySelection />
							<hr />
							<PriceRange
								title={t('Price')}
								name={PRICE}
							/>
						</FilterContent>
					</Filter>
				),
			}}
		/>
	);
};
Page.GetLayout = CollectionLayout;

export default Page;
