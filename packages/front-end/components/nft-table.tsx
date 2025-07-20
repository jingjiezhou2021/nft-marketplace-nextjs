import { ColumnDef } from '@tanstack/react-table';
import CustomTable, { CustomTableHeaderFilterButton } from './custom-table';
import Image from 'next/image';
import {
	IconBaselineDensitySmall,
	IconFilter2,
	IconMedal,
	IconStar,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { produce } from 'immer';
import { useState } from 'react';
import { Button } from './ui/button';
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerFooter,
	DrawerTrigger,
} from './ui/drawer';
import {
	BaseCircleColorful,
	EthereumCircleColorful,
} from '@ant-design/web3-icons';
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from './ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from './ui/select';
import { Input } from './ui/input';
import { useTranslation } from 'react-i18next';
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
export function formatPrice(n: number | bigint): string {
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
export function PriceCell({
	n,
	className,
}: { n: number | bigint } & React.ComponentProps<'div'>) {
	const formatted = formatPrice(n);
	return (
		<div className={cn('font-light font-mono', className)}>
			{formatted !== '-' && <span>$</span>}
			{formatted}
		</div>
	);
}
function NFTTableFilter() {
	const { t } = useTranslation('common');
	function PriceFilter({ title }: { title: string }) {
		const [open, setOpen] = useState(false);
		return (
			<Collapsible
				open={open}
				onOpenChange={setOpen}
			>
				<CollapsibleTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						className="w-full justify-between text-base font-normal hover:bg-transparent!"
					>
						{title}
						<ChevronDown
							className={cn(
								open && 'rotate-180',
								'transition-transform ease-in-out duration-200',
							)}
						/>
					</Button>
				</CollapsibleTrigger>
				<CollapsibleContent className="flex flex-col gap-4 py-3">
					<Select defaultValue="ETH">
						<SelectTrigger className="w-full group">
							<SelectValue></SelectValue>
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="ETH">ETH</SelectItem>
							<SelectItem value="USD">USD</SelectItem>
						</SelectContent>
					</Select>
					<div className="flex items-center">
						<Input placeholder={t('Min')}></Input>
						<span className="mx-3 text-sm">{t('to')}</span>
						<Input placeholder={t('Max')}></Input>
					</div>
				</CollapsibleContent>
			</Collapsible>
		);
	}
	return (
		<div className="p-6 flex flex-col gap-4 relative overflow-y-scroll">
			<h4>{t('Category')}</h4>
			<div className="flex flex-wrap gap-2">
				<Button variant="outline">{t('All')}</Button>
				<Button variant="outline">{t('Art')}</Button>
				<Button variant="outline">{t('Gaming')}</Button>
				<Button variant="outline">{t('PFPs')}</Button>
				<Button variant="outline">{t('Photography')}</Button>
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
			<PriceFilter title={t('Floor Price')} />
			<PriceFilter title={t('Top Offer')} />
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
export default function NFTTable() {
	const { t } = useTranslation('common');
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
						className="pl-2"
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
							<NFTTableFilter />
						</DrawerContent>
					</Drawer>
					<Button variant="outline">
						<IconMedal /> {t('Top')}
					</Button>
					<Button variant="outline">
						<IconStar /> {t('Watchlist')}
					</Button>
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
					left: ['watchlist', 'name'],
				}}
				rowCursor
			/>
		</>
	);
}
