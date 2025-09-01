import { QueryMode } from '@/apollo/gql/graphql';
import { FilterTags } from '@/components/filter/tag';
import { LoadingMask, LoadingSpinner } from '@/components/loading';
import CollectionLayout from '@/components/nft/collection/layout';
import NFTAvatar from '@/components/nft/image';
import ProfileAvatar from '@/components/profile/avatar';
import { ProfileCard } from '@/components/profile/profile-card';
import { config } from '@/components/providers/RainbowKitAllProvider';
import CustomTable, {
	CustomTableHeaderFilterButton,
} from '@/components/tables/custom-table';
import { PriceCell } from '@/components/tables/PriceCell';
import { Button } from '@/components/ui/button';
import findCollection from '@/lib/graphql/queries/find-collection';
import { getNFTsSaleInfo } from '@/lib/hooks/use-nfts-sale-info';
import useOwnerNftsCount from '@/lib/hooks/use-owner-nfts-count';
import { cn } from '@/lib/utils';
import { NextPageWithLayout } from '@/pages/_app';
import { useQuery } from '@apollo/client';
import { IconBaselineDensitySmall } from '@tabler/icons-react';
import { ChainIdParameter } from '@wagmi/core/internal';
import { GetServerSideProps, InferGetStaticPropsType } from 'next';
import { SSRConfig, useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

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
	const [compact, setCompact] = useState<boolean>(false);
	const params = useParams<{ chainId: string; address: string }>();
	const chainId = parseInt(params.chainId) as ChainIdParameter<
		typeof config
	>['chainId'];
	const { t } = useTranslation('common');
	const { data: collectionData, loading: collectionDataLoading } = useQuery(
		findCollection,
		{
			variables: {
				where: {
					address: {
						equals: params.address as `0x${string}`,
						mode: QueryMode.Insensitive,
					},
					chainId: {
						equals: chainId,
					},
				},
			},
		},
	);
	const { data: ownerNfts, loading: ownerNftsLoading } = useOwnerNftsCount(
		collectionData?.findFirstCollection?.importedNfts.map((nft) => {
			return {
				contractAddress: nft.contractAddress as `0x${string}`,
				tokenId: nft.tokenId,
				chainId: nft.collection.chainId,
			};
		}) ?? [],
	);
	return (
		<div className="relative flex flex-col h-auto">
			<nav className="flex items-center mb-4 justify-end">
				<div>
					<Button
						variant={compact ? 'default' : 'outline'}
						onClick={() => {
							setCompact(!compact);
						}}
						className="hidden md:inline-flex"
					>
						<IconBaselineDensitySmall />
					</Button>
				</div>
			</nav>
			<CustomTable
				data={ownerNfts?.data ?? []}
				columns={[
					{
						accessorKey: 'wallet',
						header() {
							return (
								<div className="text-muted-foreground text-xs">
									{t('WALLET')}
								</div>
							);
						},
						cell({ row }) {
							return (
								<ProfileCard
									address={
										row.original.owner as `0x${string}`
									}
								>
									{(dispName, isYou, avatar) => {
										return (
											<div className="flex items-center gap-1 w-auto">
												<ProfileAvatar
													avatar={avatar}
													address={row.original.owner}
													className={cn(
														'size-10 md:size-16',
														compact &&
															'size-10 md:size-10',
													)}
												/>
												<h4>
													{isYou
														? t('You')
														: dispName}
												</h4>
											</div>
										);
									}}
								</ProfileCard>
							);
						},
					},
					{
						accessorKey: 'owned',
						header({ column }) {
							return (
								<CustomTableHeaderFilterButton column={column}>
									{t('OWNED')}
								</CustomTableHeaderFilterButton>
							);
						},
						cell({ row }) {
							return (
								<div className="min-w-48 relative">
									<div
										className={cn(
											'bg-primary/50 h-4 sm:h-6 md:h-10 rounded-md',
											compact && 'h-4 sm:h-6 md:h-8',
										)}
										style={{
											width: `${(row.original.nfts.length / (ownerNfts?.maxCount ?? Infinity)) * 100}%`,
										}}
									></div>
									<div className="absolute left-4 top-1/2 -translate-1/2 text-sm md:text-base">
										{row.original.nfts.length}
									</div>
								</div>
							);
						},
						sortingFn(r1, r2) {
							return (
								r2.original.nfts.length -
								r1.original.nfts.length
							);
						},
					},
					{
						accessorKey: 'totalValue',
						header({ column }) {
							return (
								<CustomTableHeaderFilterButton column={column}>
									{t('TOTAL VALUE')}
								</CustomTableHeaderFilterButton>
							);
						},
						cell({ row }) {
							return (
								<PriceCell
									n={row.original.saleInfo.totalValueInUSD}
								/>
							);
						},
						sortingFn(r1, r2) {
							return (
								r2.original.saleInfo.totalValueInUSD -
								r1.original.saleInfo.totalValueInUSD
							);
						},
					},
					{
						accessorKey: 'items',
						header({ column }) {
							return (
								<div className="text-muted-foreground text-xs">
									{t('ITEMS')}
								</div>
							);
						},
						cell({ row }) {
							return (
								<div className="flex gap-2 items-center">
									{row.original.nfts
										.slice(0, 5)
										.map((nft) => {
											return (
												<NFTAvatar
													{...nft}
													key={nft.tokenId}
													className={cn(
														'mr-0 rounded-md size-10 md:size-16',
														compact &&
															'size-10 md:size-10',
													)}
												/>
											);
										})}
									{row.original.nfts.length > 5 && (
										<span>
											+ {row.original.nfts.length - 5}
										</span>
									)}
								</div>
							);
						},
					},
				]}
				columnPinningState={{
					left: ['wallet', 'owned'],
				}}
				rowCursor={false}
				className="pb-4"
				loading={collectionDataLoading || ownerNftsLoading}
			/>
		</div>
	);
};

Page.GetLayout = CollectionLayout;

export default Page;
