import CustomTable from '../custom-table';
import {
	IconBaselineDensitySmall,
	IconFilter2,
	IconMedal,
	IconStar,
} from '@tabler/icons-react';
import { produce } from 'immer';
import { useState } from 'react';
import { Button } from '../../ui/button';
import { Drawer, DrawerContent, DrawerTrigger } from '../../ui/drawer';
import GetNFTColumns, { NFT } from './columns';
import NFTTableFilterContent from './filter';
import { useTranslation } from 'next-i18next';
import { Filter } from '@/components/filter';

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
	const [compact, setCompact] = useState<boolean>(false);
	const columns = GetNFTColumns(compact, (row) => {
		const nextData = produce(data, (draft) => {
			const target = draft.find((d) => {
				return d.id === row.original.id;
			});
			target.watched = !target.watched;
			return draft;
		});
		setData(nextData);
	});
	return (
		<>
			<nav className="sticky top-0 px-4 flex items-center mb-4 justify-between">
				<div className="flex gap-2">
					<Filter>
						<NFTTableFilterContent />
					</Filter>
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
