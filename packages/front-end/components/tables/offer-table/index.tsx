import { useTranslation } from 'next-i18next';
import ItemColumn from '../activity-table/item';
import CustomTable, { CustomTableHeaderFilterButton } from '../custom-table';
import useItemOfferMades from '@/lib/hooks/use-item-offers';
import OfferStatusBadge from '@/components/offer-status-badge';
import CryptoPrice from '@/components/crypto-price';
import TimeDisplay from '@/components/time-display';
import { LoadingMask, LoadingSpinner } from '@/components/loading';
import { Button } from '@/components/ui/button';
import { IconBaselineDensitySmall } from '@tabler/icons-react';
import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { ValuesType } from 'utility-types';

export default function OfferTable({
	compact,
	data,
	expandColumnsFn,
}: {
	compact?: boolean;
	data: ReturnType<typeof useItemOfferMades>['data'];
	expandColumnsFn?: (
		initialColumns: ColumnDef<
			ValuesType<
				NonNullable<ReturnType<typeof useItemOfferMades>['data']>
			>
		>[],
	) => ColumnDef<
		ValuesType<NonNullable<ReturnType<typeof useItemOfferMades>['data']>>
	>[];
}) {
	const { t } = useTranslation('common');
	const initialColumns = [
		{
			accessorKey: 'item',
			header: () => {
				return (
					<div className="text-muted-foreground text-xs">
						{t('ITEM')}
					</div>
				);
			},
			cell({ row }) {
				return (
					<ItemColumn
						compact={compact}
						chainId={row.original.event.offer.chainId}
						address={
							row.original.event.offer.nftAddress as `0x${string}`
						}
						tokenId={row.original.event.offer.tokenId}
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
					<OfferStatusBadge
						offerId={row.original.event.offer.offerId}
						chainId={row.original.event.offer.chainId}
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
				return row.original.event.offer.listing ? (
					<CryptoPrice
						{...{
							...row.original.event.offer.listing,
							chainId: row.original.event.offer.chainId,
						}}
					/>
				) : (
					'-'
				);
			},
			sortingFn(d1, d2) {
				return (
					(d1.original.usdPrice ?? 0) - (d2.original.usdPrice ?? 0)
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
							...row.original.saleInfo.topOfferListing,
							chainId: row.original.event.offer.chainId,
						}}
					/>
				) : (
					'-'
				);
			},
			sortingFn(row1, row2) {
				return (
					(row1.original.saleInfo.topOfferListing?.usdPrice ?? 0) -
					(row2.original.saleInfo.topOfferListing?.usdPrice ?? 0)
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
							...row.original.saleInfo.floorSaleListing,
							chainId: row.original.event.offer.chainId,
						}}
					/>
				) : (
					'-'
				);
			},
			sortingFn(row1, row2) {
				return (
					(row1.original.saleInfo.floorSaleListing?.usdPrice ?? 0) -
					(row2.original.saleInfo.floorSaleListing?.usdPrice ?? 0)
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
				return <TimeDisplay time={row.original.event.createdAt} />;
			},
			sortingFn(row1, row2) {
				return (
					new Date(row2.original.event.createdAt).getTime() -
					new Date(row1.original.event.createdAt).getTime()
				);
			},
		},
	];
	return (
		<CustomTable
			columns={
				expandColumnsFn
					? expandColumnsFn(initialColumns)
					: initialColumns
			}
			data={data ?? []}
			columnPinningState={{
				left: ['item'],
			}}
			rowCursor={false}
			className="grow min-h-0 overflow-y-auto pb-4"
		/>
	);
}

export function OfferTableWrapper({
	data,
	loading,
	expandColumnsFn,
}: {
	data: ReturnType<typeof useItemOfferMades>['data'];
	loading?: boolean;
	expandColumnsFn?: (
		initialColumns: ColumnDef<
			ValuesType<
				NonNullable<ReturnType<typeof useItemOfferMades>['data']>
			>
		>[],
	) => ColumnDef<
		ValuesType<NonNullable<ReturnType<typeof useItemOfferMades>['data']>>
	>[];
}) {
	const [compact, setCompact] = useState<boolean>(false);
	return (
		<div className="h-full flex flex-col relative">
			<LoadingMask
				loading={!!loading}
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
			<OfferTable
				data={data}
				compact={compact}
				expandColumnsFn={expandColumnsFn}
			/>
		</div>
	);
}
