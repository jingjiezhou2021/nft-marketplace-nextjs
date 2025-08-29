import { cn } from '@/lib/utils';
import { IconStar } from '@tabler/icons-react';
import { ColumnDef, Row } from '@tanstack/react-table';
import Image from 'next/image';
import { CustomTableHeaderFilterButton } from '../custom-table';
import { PriceCell } from '../PriceCell';
import { useTranslation } from 'next-i18next';
import { ReactElement } from 'react';
import { Category, Listing } from '@/apollo/gql/graphql';
import { config } from '@/components/providers/RainbowKitAllProvider';
import { ChainIdParameter } from '@wagmi/core/internal';
import CryptoPrice from '@/components/crypto-price';
import { getIconOfChain } from '@/lib/chain';
export interface NFT {
	id: number;
	cover: string | ReactElement;
	name: string;
	category: Category;
	floorPrice:
		| (Pick<Listing, 'erc20TokenAddress' | 'price' | 'erc20TokenName'> & {
				chainId: ChainIdParameter<typeof config>['chainId'];
				usdPrice: number;
		  })
		| null;
	topOffer:
		| (Pick<Listing, 'erc20TokenAddress' | 'price' | 'erc20TokenName'> & {
				chainId: ChainIdParameter<typeof config>['chainId'];
				usdPrice: number;
		  })
		| null;
	chainId: ChainIdParameter<typeof config>['chainId'];
	volume: number;
	sales: number;
	owners: number;
	supply: number;
	watched: boolean;
	address: string;
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
						className="pl-2 relative z-20"
						onClick={(e) => {
							e.stopPropagation();
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
								'size-[32px] rounded-md overflow-hidden md:size-[64px] relative',
								compact && 'size-[32px]!',
							)}
						>
							{!compact && (
								<div className="absolute right-0 bottom-0">
									{getIconOfChain(row.original.chainId)}
								</div>
							)}
							{typeof row.original.cover === 'string' ? (
								<Image
									width={64}
									height={64}
									src={row.original.cover}
									alt="nft cover"
								/>
							) : (
								row.original.cover
							)}
						</div>
						{row.original.name}
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
				return row.original.floorPrice ? (
					<CryptoPrice {...row.original.floorPrice} />
				) : (
					<div>-</div>
				);
			},
			sortingFn(d1, d2) {
				return (
					(d1.original.floorPrice?.usdPrice ?? 0) -
					(d2.original.floorPrice?.usdPrice ?? 0)
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
				return row.original.topOffer ? (
					<CryptoPrice {...row.original.topOffer} />
				) : (
					<div>-</div>
				);
			},
			sortingFn(d1, d2) {
				return (
					(d1.original.topOffer?.usdPrice ?? 0) -
					(d2.original.topOffer?.usdPrice ?? 0)
				);
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
				return <PriceCell n={row.original.volume} />;
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
						{row.original.sales.toLocaleString()}
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
						{row.original.owners.toLocaleString()}
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
						{row.original.supply.toLocaleString()}
					</div>
				);
			},
		},
	];
}
