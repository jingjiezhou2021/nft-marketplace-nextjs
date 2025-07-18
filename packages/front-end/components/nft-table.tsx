import { ColumnDef } from '@tanstack/react-table';
import CustomTable, { CustomTableHeaderFilterButton } from './custom-table';
import Image from 'next/image';
import { IconStar } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { produce } from 'immer';
import { useState } from 'react';
interface NFT {
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
function formatPrice(n: number | bigint): string {
	if (typeof n === 'bigint') {
		n = Number(n);
	}
	if (n === 0) {
		return '-';
	}
	if (n < 1e4) {
		return n.toLocaleString();
	} else if (n < 1e6) {
		return `${(n / 1e3).toFixed(1)}K`;
	} else if (n < 1e9) {
		return `${(n / 1e6).toFixed(1)}M`;
	} else {
		return `${(n / 1e9).toFixed(1)}B`;
	}
}
function PriceCell({ n }: { n: number | bigint }) {
	const formatted = formatPrice(n);
	return (
		<div className="font-light font-mono">
			{formatted !== '-' && <span>$</span>}
			{formatted}
		</div>
	);
}
export default function NFTTable() {
	const [data, setData] = useState<NFT[]>([
		{
			cover: '/example5-1.png',
			id: 0n,
			name: 'Bored Ape Yacht Club',
			floorPrice: 39100,
			topOffer: 38100,
			volume: 20863819832,
			sales: 52620,
			owners: 5511,
			supply: 9998,
			watched: false,
		},
		{
			cover: '/example5-2.avif',
			id: 1n,
			name: 'CryptoPunks',
			floorPrice: 144000,
			topOffer: 0,
			volume: 13293929387,
			sales: 24772,
			owners: 3863,
			supply: 9994,
			watched: false,
		},
		{
			cover: '/example5-3.png',
			id: 2n,
			name: 'Mutant Ape Yacht Club',
			floorPrice: 5984.85,
			topOffer: 5861.111,
			volume: 2902138273,
			sales: 122007,
			owners: 11874,
			supply: 19553,
			watched: false,
		},
	]);
	const columns: ColumnDef<NFT>[] = [
		{
			id: 'watchlist',
			cell({ row }) {
				return (
					<div
						onClick={() => {
							const nextData = produce(data, (draft) => {
								const target = draft.find((d) => {
									return d.id === row.original.id;
								});
								target.watched = !target.watched;
								return draft;
							});
							setData(nextData);
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
						COLLECTION
					</div>
				);
			},
			cell({ row }) {
				return (
					<div className="font-light flex gap-2 items-center">
						<div className="size-[32px] rounded-md overflow-hidden md:size-[64px]">
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
						FLOOR PRICE
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
						TOP OFFER
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
						VOL
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
						SALES
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
						OWNERS
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
						SUPPLY
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
	return (
		<CustomTable
			columns={columns}
			data={data}
			columnPinningState={{
				left: ['watchlist', 'name'],
			}}
		/>
	);
}
