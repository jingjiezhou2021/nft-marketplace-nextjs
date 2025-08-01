import { cn } from '@/lib/utils';
import { IconArrowUpRight, IconTag } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';
import { formatDistance } from 'date-fns';
import getDateFnsLocale from '@/lib/getDateFnsLocale';
import { PriceCell } from '../PriceCell';
import { useTranslation } from 'next-i18next';
export enum Event {
	Listing,
	Transfer,
	Sale,
	Offer,
}
export interface Activity {
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
export function EventToString(e: Event, translate: boolean = true) {
	const { t } = useTranslation('common');
	switch (e) {
		case Event.Listing:
			return translate ? t('Listing') : 'Listing';
		case Event.Transfer:
			return translate ? t('Transfer') : 'Transfer';
		case Event.Offer:
			return translate ? t('Item Offer') : 'Item Offer';
		case Event.Sale:
			return translate ? t('Sale') : 'Sale';
	}
}
export default function GetActivityColumns(
	compact: boolean,
): ColumnDef<Activity>[] {
	const { t, i18n } = useTranslation('common');
	return [
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
}
