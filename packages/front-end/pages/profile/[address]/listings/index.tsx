import ProfileLayout from '@/components/profile/layout';
import { Button } from '@/components/ui/button';
import { NextPageWithLayout } from '@/pages/_app';
import {
	IconArrowUpRight,
	IconBaselineDensitySmall,
} from '@tabler/icons-react';
import { GetServerSideProps } from 'next';
import { SSRConfig, useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useState } from 'react';
import CustomTable, {
	CustomTableHeaderFilterButton,
} from '@/components/tables/custom-table';
import useUser, { useUserListings } from '@/lib/hooks/use-user';
import { useAccount } from 'wagmi';
import { LoadingMask, LoadingSpinner } from '@/components/loading';
import CryptoPrice from '@/components/crypto-price';
import { getDateDiffStr } from '@/lib/utils';
import getDateFnsLocale from '@/lib/getDateFnsLocale';
import ProfileAvatar from '@/components/profile/avatar';
import { Badge } from '@/components/ui/badge';
import { CircleCheck, ShoppingBag } from 'lucide-react';
import ProfileListingStatus from '@/components/profile/listing';
import ItemColumn from '@/components/tables/activity-table/item';
import TimeDisplay from '@/components/time-display';
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
	const [compact, setCompact] = useState<boolean>(false);
	const { address } = useParams<{ address: string }>();
	const { data, loading } = useUserListings(address);
	const { t, i18n } = useTranslation('common');
	return (
		<div className="h-full flex flex-col relative">
			<LoadingMask
				loading={loading}
				className="flex justify-center items-center"
			>
				<LoadingSpinner size={48} />
			</LoadingMask>
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
				columns={[
					{
						accessorKey: 'listing',
						header: () => {
							return (
								<div className="text-muted-foreground text-xs">
									{t('LISTING')}
								</div>
							);
						},
						cell({ row }) {
							return (
								<ItemColumn
									compact={compact}
									chainId={row.original.event.chainId}
									address={
										row.original.event.nft
											?.contractAddress! as `0x${string}`
									}
									tokenId={row.original.event.nft?.tokenId}
								/>
							);
						},
					},
					{
						accessorKey: 'status',
						header: () => {
							return (
								<div className="text-muted-foreground text-xs">
									{t('STATUS')}
								</div>
							);
						},
						cell({ row }) {
							return (
								<ProfileListingStatus
									listingId={row.original.event.id}
								/>
							);
						},
					},
					{
						accessorKey: 'price',
						header: ({ column }) => {
							return (
								<CustomTableHeaderFilterButton column={column}>
									{t('PRICE')}
								</CustomTableHeaderFilterButton>
							);
						},
						cell({ row }) {
							return row.original.event.listing ? (
								<CryptoPrice
									{...{
										...row.original.event.listing,
										chainId: row.original.event.chainId,
									}}
								/>
							) : (
								'-'
							);
						},
						sortingFn(d1, d2) {
							return (
								(d1.original.usdPrice ?? 0) -
								(d2.original.usdPrice ?? 0)
							);
						},
					},
					{
						accessorKey: 'topOffer',
						header: ({ column }) => {
							return (
								<CustomTableHeaderFilterButton column={column}>
									{t('TOP OFFER')}
								</CustomTableHeaderFilterButton>
							);
						},
						cell({ row }) {
							return row.original.saleInfo.topOfferListing ? (
								<CryptoPrice
									{...{
										...row.original.saleInfo
											.topOfferListing,
										chainId: row.original.event.chainId,
									}}
								/>
							) : (
								'-'
							);
						},
						sortingFn(row1, row2) {
							return (
								(row1.original.saleInfo.topOfferListing
									?.usdPrice ?? 0) -
								(row2.original.saleInfo.topOfferListing
									?.usdPrice ?? 0)
							);
						},
					},
					{
						accessorKey: 'floor',
						header: ({ column }) => {
							return (
								<CustomTableHeaderFilterButton column={column}>
									{t('FLOOR PRICE')}
								</CustomTableHeaderFilterButton>
							);
						},
						cell({ row }) {
							return row.original.saleInfo.floorSaleListing ? (
								<CryptoPrice
									{...{
										...row.original.saleInfo
											.floorSaleListing,
										chainId: row.original.event.chainId,
									}}
								/>
							) : (
								'-'
							);
						},
						sortingFn(row1, row2) {
							return (
								(row1.original.saleInfo.floorSaleListing
									?.usdPrice ?? 0) -
								(row2.original.saleInfo.floorSaleListing
									?.usdPrice ?? 0)
							);
						},
					},
					{
						accessorKey: 'time',
						header: ({ column }) => {
							return (
								<CustomTableHeaderFilterButton column={column}>
									{t('TIME')}
								</CustomTableHeaderFilterButton>
							);
						},
						cell({ row }) {
							return (
								<TimeDisplay
									time={row.original.event.createdAt}
								/>
							);
						},
						sortingFn(row1, row2) {
							return (
								new Date(
									row2.original.event.createdAt,
								).getTime() -
								new Date(
									row1.original.event.createdAt,
								).getTime()
							);
						},
					},
				]}
				data={data ?? []}
				columnPinningState={{
					left: ['listing'],
				}}
				rowCursor={false}
				className="grow min-h-0 overflow-y-auto pb-4"
			/>
		</div>
	);
};

Page.GetLayout = ProfileLayout;

export default Page;
