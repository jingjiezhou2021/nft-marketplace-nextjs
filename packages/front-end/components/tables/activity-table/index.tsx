import { IconBaselineDensitySmall, IconFilter2 } from '@tabler/icons-react';
import { Drawer, DrawerContent, DrawerTrigger } from '../../ui/drawer';
import { Button } from '../../ui/button';
import CustomTable from '../custom-table';
import { useState } from 'react';
import GetActivityColumns, { Activity, Event } from './columns';
import ActivityFilterContent from './filter';
import { Filter } from '@/components/filter';

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
			<nav className="sticky top-0 flex items-center mb-4 justify-between">
				<div className="flex gap-2">
					<Filter>
						<ActivityFilterContent />
					</Filter>
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
