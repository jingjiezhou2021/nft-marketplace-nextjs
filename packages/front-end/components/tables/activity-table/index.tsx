import {
	IconArrowUpRight,
	IconBaselineDensitySmall,
	IconFilter2,
	IconTag,
} from '@tabler/icons-react';
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerTrigger,
} from '../../ui/drawer';
import { Button } from '../../ui/button';
import CustomTable from '../custom-table';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	BaseCircleColorful,
	EthereumCircleColorful,
} from '@ant-design/web3-icons';
import { PriceFilter } from '../PriceFilter';
import GetActivityColumns, { Activity, Event, EventToString } from './columns';

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
export default function ActivityTable() {
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
	const columns = GetActivityColumns(compact);
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
