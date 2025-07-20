import { cn } from '@/lib/utils';
import { IconStar } from '@tabler/icons-react';
import { ColumnDef, Row } from '@tanstack/react-table';
import Image from 'next/image';
import { CustomTableHeaderFilterButton } from '../custom-table';
import { PriceCell } from '../PriceCell';
import { useTranslation } from 'next-i18next';
export interface NFT {
	cover: string;
	id: bigint;
	name: string;
	floorPrice: number;
	topOffer: number;
	volume: number;
	sales: number;
	owners: number;
	supply: number;
	watched: boolean;
}

export default function GetNFTColumns(
	compact: boolean,
	onWatch: (row: Row<NFT>) => void,
): ColumnDef<NFT>[] {
	const { t } = useTranslation('common');
	return [
		{
			id: 'watchlist',
			cell({ row }) {
				return (
					<div
						className="pl-2"
						onClick={() => {
							onWatch(row);
						}}
					>
						<IconStar
							size={18}
							className={cn(
								'text-muted-foreground',
								row.original.watched &&
									'fill-primary text-primary',
							)}
						/>
					</div>
				);
			},
		},
		{
			accessorKey: 'name',
			header: () => {
				return (
					<div className="text-muted-foreground text-xs">
						{t('COLLECTION')}
					</div>
				);
			},
			cell({ row }) {
				return (
					<div className="font-light flex gap-2 items-center">
						<div
							className={cn(
								'size-[32px] rounded-md overflow-hidden md:size-[64px]',
								compact && 'size-[32px]!',
							)}
						>
							<Image
								width={64}
								height={64}
								src={row.original.cover}
								alt="nft cover"
							/>
						</div>
						{row.getValue('name')}
					</div>
				);
			},
		},
		{
			accessorKey: 'floorPrice',
			header: ({ column }) => {
				return (
					<CustomTableHeaderFilterButton column={column}>
						{t('FLOOR PRICE')}
					</CustomTableHeaderFilterButton>
				);
			},
			cell({ row }) {
				return <PriceCell n={row.getValue<number>('floorPrice')} />;
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
				return <PriceCell n={row.getValue<number>('topOffer')} />;
			},
		},
		{
			accessorKey: 'volume',
			header: ({ column }) => {
				return (
					<CustomTableHeaderFilterButton column={column}>
						{t('VOL')}
					</CustomTableHeaderFilterButton>
				);
			},
			cell({ row }) {
				return <PriceCell n={row.getValue<number>('volume')} />;
			},
		},
		{
			accessorKey: 'sales',
			header: ({ column }) => {
				return (
					<CustomTableHeaderFilterButton column={column}>
						{t('SALES')}
					</CustomTableHeaderFilterButton>
				);
			},
			cell({ row }) {
				return (
					<div className="font-light tracking-wider">
						{row.getValue<number>('sales').toLocaleString()}
					</div>
				);
			},
		},
		{
			accessorKey: 'owners',
			header: ({ column }) => {
				return (
					<CustomTableHeaderFilterButton column={column}>
						{t('OWNERS')}
					</CustomTableHeaderFilterButton>
				);
			},
			cell({ row }) {
				return (
					<div className="font-light tracking-wider">
						{row.getValue<number>('owners').toLocaleString()}
					</div>
				);
			},
		},
		{
			accessorKey: 'supply',
			header: ({ column }) => {
				return (
					<CustomTableHeaderFilterButton column={column}>
						{t('SUPPLY')}
					</CustomTableHeaderFilterButton>
				);
			},
			cell({ row }) {
				return (
					<div className="font-light tracking-wider">
						{row.getValue<number>('supply').toLocaleString()}
					</div>
				);
			},
		},
	];
}
