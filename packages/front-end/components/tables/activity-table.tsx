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
import { Drawer, DrawerClose, DrawerContent, DrawerTrigger } from '../ui/drawer';
import { Button } from '../ui/button';
import CustomTable from './custom-table';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	BaseCircleColorful,
	EthereumCircleColorful,
} from '@ant-design/web3-icons';
import { PriceFilter } from './PriceFilter';
import getDateFnsLocale from '@/lib/getDateFnsLocale';
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
function ActivityFilter() {
	const { t } = useTranslation('common');
	return (
		<div className="p-6 flex flex-col gap-4 relative overflow-y-scroll">
			<h4>{t('Staus')}</h4>
			<div className="flex flex-wrap gap-2">
				<Button variant="outline">{t('All')}</Button>
				<Button variant="outline">{EventToString(Event.Sale)}</Button>
				<Button variant="outline">
					{EventToString(Event.Transfer)}
				</Button>
				<Button variant="outline">
					{EventToString(Event.Listing)}
				</Button>
				<Button variant="outline">{EventToString(Event.Offer)}</Button>
			</div>
			<hr />
			<h4>{t('Chains')}</h4>
			<div className="flex flex-wrap gap-2">
				<Button variant="outline">
					<EthereumCircleColorful />
					Ethereum
				</Button>
				<Button variant="outline">
					<BaseCircleColorful />
					Base
				</Button>
			</div>
			<PriceFilter title={t('Price')} />
			<div className="flex justify-between gap-2 sticky bottom-0  bg-background">
				<DrawerClose asChild>
					<Button
						variant="outline"
						className="grow"
					>
						{t('Clear All')}
					</Button>
				</DrawerClose>
				<DrawerClose asChild>
					<Button className="grow">{t('Done')}</Button>
				</DrawerClose>
			</div>
		</div>
	);
}
function EventToString(e: Event) {
	const { t } = useTranslation('common');
	switch (e) {
		case Event.Listing:
			return t('Listing');
		case Event.Transfer:
			return t('Transfer');
		case Event.Offer:
			return t('Item Offer');
		case Event.Sale:
			return t('Sale');
	}
}
export default function ActivityTable() {
	const { t, i18n } = useTranslation('common');
	const columns: ColumnDef<Activity>[] = [
		{
			accessorKey: 'event',
			header: () => {
				return (
					<div className="text-muted-foreground text-xs">
						{t('EVENT')}
					</div>
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
					<div className="text-muted-foreground text-xs">
						{t('ITEM')}
					</div>
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
					<div className="text-muted-foreground text-xs">
						{t('PRICE')}
					</div>
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
						{t('QUANTITY')}
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
					<div className="text-muted-foreground text-xs">
						{t('FROM')}
					</div>
				);
			},
			cell({ row }) {
				return <div className="font-light">{row.original.from}</div>;
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
				return <div className="font-light">{row.original.to}</div>;
			},
		},
		{
			accessorKey: 'time',
			header: () => {
				return (
					<div className="text-muted-foreground text-xs">
						{t('TIME')}
					</div>
				);
			},
			cell({ row }) {
				return (
					<div className="font-serif flex items-center cursor-pointer">
						{formatDistance(new Date(), row.original.time, {
							addSuffix: true,
							locale: getDateFnsLocale(i18n.language),
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
						<DrawerContent>
							<ActivityFilter />
						</DrawerContent>
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
