import { cn } from '@/lib/utils';
import {
	IconArrowUpRight,
	IconBaselineDensitySmall,
	IconFilter2,
	IconTag,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';
import { PriceCell } from './nft-table';
import { formatDistance } from 'date-fns';
import { Drawer, DrawerContent, DrawerTrigger } from './ui/drawer';
import { Button } from './ui/button';
import CustomTable from './custom-table';
import { useState } from 'react';
enum Event {
	Listing,
	Transfer,
	Sale,
	Offer,
}
interface Activity {
	event: Event;
	item: {
		name: string;
		collectionName: string;
		cover: string;
	};
	price: number;
	quantity: number;
	from: string;
	to: string;
	time: Date;
}
function EventToString(e: Event) {
	switch (e) {
		case Event.Listing:
			return 'Listing';
		case Event.Transfer:
			return 'Transfer';
		case Event.Offer:
			return 'Item Offer';
		case Event.Sale:
			return 'Sale';
	}
}
export default function ActivityTable() {
	const columns: ColumnDef<Activity>[] = [
		{
			accessorKey: 'event',
			header: () => {
				return (
					<div className="text-muted-foreground text-xs">EVENT</div>
				);
			},
			cell({ row }) {
				return (
					<div className="font-bold flex gap-2 items-center">
						<IconTag size={20} />
						{EventToString(row.original.event)}
					</div>
				);
			},
		},
		{
			accessorKey: 'item',
			header: () => {
				return (
					<div className="text-muted-foreground text-xs">ITEM</div>
				);
			},
			cell({ row }) {
				return (
					<div className="flex gap-2 items-center">
						<div
							className={cn(
								'size-[32px] rounded-md overflow-hidden md:size-[64px]',
								compact && 'size-[32px]!',
							)}
						>
							<Image
								width={64}
								height={64}
								src={row.original.item.cover}
								alt="nft cover"
							/>
						</div>
						<div
							className={cn(
								'flex flex-col gap-2',
								compact && 'gap-0',
							)}
						>
							<h3 className="font-bold">
								{row.original.item.name}
							</h3>
							<p className="text-muted-foreground">
								{row.original.item.collectionName}
							</p>
						</div>
					</div>
				);
			},
		},
		{
			accessorKey: 'price',
			header: () => {
				return (
					<div className="text-muted-foreground text-xs">PRICE</div>
				);
			},
			cell({ row }) {
				return <PriceCell n={row.original.price} />;
			},
		},
		{
			accessorKey: 'quantity',
			header: () => {
				return (
					<div className="text-muted-foreground text-xs">
						QUANTITY
					</div>
				);
			},
			cell({ row }) {
				return (
					<div className="font-light">{row.original.quantity}</div>
				);
			},
		},
		{
			accessorKey: 'from',
			header: () => {
				return (
					<div className="text-muted-foreground text-xs">FROM</div>
				);
			},
			cell({ row }) {
				return <div className="font-light">{row.original.from}</div>;
			},
		},
		{
			accessorKey: 'to',
			header: () => {
				return <div className="text-muted-foreground text-xs">TO</div>;
			},
			cell({ row }) {
				return <div className="font-light">{row.original.to}</div>;
			},
		},
		{
			accessorKey: 'time',
			header: () => {
				return (
					<div className="text-muted-foreground text-xs">TIME</div>
				);
			},
			cell({ row }) {
				return (
					<div className="font-serif flex items-center cursor-pointer">
						{formatDistance(new Date(), row.original.time, {
							addSuffix: true,
						})}
						<IconArrowUpRight className="text-muted-foreground" />
					</div>
				);
			},
		},
	];
	const data: Activity[] = [
		{
			event: Event.Sale,
			item: {
				cover: '/example5-1.png',
				name: 'Item #91',
				collectionName: 'Bored Ape Yacht Club',
			},
			price: 39201,
			quantity: 1,
			from: '0x9283',
			to: '0x9293',
			time: new Date(2025, 7, 17, 8, 19, 29),
		},
		{
			event: Event.Transfer,
			item: {
				cover: '/example5-2.avif',
				name: 'Item #87',
				collectionName: 'CryptoPunks',
			},
			price: 148920,
			quantity: 1,
			from: '0x9283',
			to: '0x9293',
			time: new Date(2025, 7, 17, 8, 19, 29),
		},
		{
			event: Event.Listing,
			item: {
				cover: '/example5-3.png',
				name: 'Item #126',
				collectionName: 'Mutant Ape Yacht Club',
			},
			price: 8210.82,
			quantity: 1,
			from: '0x9283',
			to: '0x0000',
			time: new Date(2025, 7, 17, 8, 19, 29),
		},
	];
	const [compact, setCompact] = useState<boolean>(false);
	return (
		<>
			<nav className="sticky top-0 px-4 flex items-center mb-4 justify-between">
				<div className="flex gap-2">
					<Drawer>
						<DrawerTrigger asChild>
							<Button
								className="-ml-3"
								variant="outline"
							>
								<IconFilter2 />
							</Button>
						</DrawerTrigger>
						<DrawerContent></DrawerContent>
					</Drawer>
				</div>
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
				columns={columns}
				data={data}
				columnPinningState={{
					left: ['event', 'item'],
				}}
				rowCursor={false}
			/>
		</>
	);
}
