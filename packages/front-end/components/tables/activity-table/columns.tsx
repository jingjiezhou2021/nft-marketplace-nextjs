import { cn, getDateDiffStr } from '@/lib/utils';
import { IconArrowUpRight, IconTag } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';
import { formatDistance } from 'date-fns';
import getDateFnsLocale from '@/lib/getDateFnsLocale';
import { PriceCell } from '../PriceCell';
import { useTranslation } from 'next-i18next';
import { EventToString } from '@/components/filter/selection/activity-selection';
import { Listing } from '@/apollo/gql/graphql';
import { config } from '@/components/providers/RainbowKitAllProvider';
import { ChainIdParameter } from '@wagmi/core/internal';
import CryptoPrice from '@/components/crypto-price';
import { getAddressAbbreviation } from '@/lib/address';
import { CustomTableHeaderFilterButton } from '../custom-table';
import { ProfileCard } from '@/components/profile/profile-card';
import Link from 'next/link';
import { getIconOfChain } from '@/lib/chain';
import ItemColumn from './item';
export enum Event {
	Listing = 'NftMarketplace__ItemListed',
	ListingCanceled = 'NftMarketplace__ItemCanceled',
	Transfer = 'NftMarketplace__ItemTransfered',
	Sale = 'NftMarketplace__ItemBought',
	Offer = 'NftMarketplace__ItemOfferMade',
}
export interface Activity {
	event: Event;
	chainId: ChainIdParameter<typeof config>['chainId'];
	nftAddress: `0x${string}`;
	tokenId: number;
	item: {
		name: string;
		collectionName: string;
		cover: string;
	};
	price:
		| (Pick<Listing, 'erc20TokenAddress' | 'erc20TokenName' | 'price'> & {
				chainId: ChainIdParameter<typeof config>['chainId'];
				usdPrice: number;
		  })
		| null;
	from?: string | null;
	to?: string | null;
	time: Date;
}

export default function GetActivityColumns(
	compact: boolean,
	expandedColumns?: ColumnDef<Activity>[],
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
					<ItemColumn
						compact={compact}
						chainId={row.original.chainId}
						address={row.original.nftAddress}
						tokenId={row.original.tokenId}
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
				return row.original.price ? (
					<CryptoPrice {...row.original.price} />
				) : (
					'-'
				);
			},
			sortingFn(d1, d2) {
				return (
					(d1.original.price?.usdPrice ?? 0) -
					(d2.original.price?.usdPrice ?? 0)
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
				return (
					<div className="font-light">
						{row.original.from ? (
							<ProfileCard
								address={row.original.from as `0x${string}`}
							>
								{(dispName, isYou) => (
									<h4>{isYou ? t('You') : dispName}</h4>
								)}
							</ProfileCard>
						) : (
							'-'
						)}
					</div>
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
				return (
					<div className="font-light">
						{row.original.to ? (
							<ProfileCard
								address={row.original.to as `0x${string}`}
							>
								{(dispName, isYou) => (
									<h4>{isYou ? t('You') : dispName}</h4>
								)}
							</ProfileCard>
						) : (
							'-'
						)}
					</div>
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
					<div className="font-serif flex items-center cursor-pointer">
						{getDateDiffStr(
							new Date(),
							row.original.time,
							getDateFnsLocale(i18n.language),
						)}
						<IconArrowUpRight className="text-muted-foreground" />
					</div>
				);
			},
		},
		...(expandedColumns ?? []),
	];
}
