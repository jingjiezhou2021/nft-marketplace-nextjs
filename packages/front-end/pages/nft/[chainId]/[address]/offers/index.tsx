import CollectionLayout from '@/components/nft/collection/layout';
import { ProfileCard } from '@/components/profile/profile-card';
import { config } from '@/components/providers/RainbowKitAllProvider';
import { OfferTableWrapper } from '@/components/tables/offer-table';
import { useCollectionItemOfferMades } from '@/lib/hooks/use-collection-item-offer-mades';
import { NextPageWithLayout } from '@/pages/_app';
import { ChainIdParameter } from '@wagmi/core/internal';
import { GetServerSideProps, InferGetStaticPropsType } from 'next';
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
const Page: NextPageWithLayout = (
	_props: Awaited<InferGetStaticPropsType<typeof getServerSideProps>>,
) => {
	const { t } = useTranslation('common');
	const params = useParams<{
		chainId: string;
		address: `0x${string}`;
	}>();
	const chainId = parseInt(params.chainId) as ChainIdParameter<
		typeof config
	>['chainId'];
	const address = params.address as `0x${string}`;
	const { data, loading } = useCollectionItemOfferMades(address, chainId);
	return (
		<OfferTableWrapper
			data={data}
			loading={loading}
			expandColumnsFn={(columns) => {
				return [
					...columns.slice(0, -1),
					{
						accessorKey: 'from',
						header: () => {
							return (
								<div className="text-muted-foreground text-xs">
									{t('FROM')}
								</div>
							);
						},
						cell({ row }) {
							return (
								<ProfileCard
									address={
										row.original.event.offer
											.buyer as `0x${string}`
									}
								>
									{(dispName, isYou) => (
										<h4>{isYou ? t('You') : dispName}</h4>
									)}
								</ProfileCard>
							);
						},
					},
					{
						accessorKey: 'to',
						header: () => {
							return (
								<div className="text-muted-foreground text-xs">
									{t('TO')}
								</div>
							);
						},
						cell({ row }) {
							return row.original.event.seller ? (
								<ProfileCard
									address={
										row.original.event
											.seller as `0x${string}`
									}
								>
									{(dispName, isYou) => (
										<h4>{isYou ? t('You') : dispName}</h4>
									)}
								</ProfileCard>
							) : (
								<span>-</span>
							);
						},
					},
					columns.at(-1)!,
				];
			}}
		/>
	);
};
Page.GetLayout = CollectionLayout;
export default Page;
