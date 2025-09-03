import { LoadingMask, LoadingSpinner } from '@/components/loading';
import CustomTable from '../custom-table';
import GetActivityColumns, { Activity } from './columns';
import { Filter } from '@/components/filter';
import ActivityFilterContent from './filter';
import { Button } from '@/components/ui/button';
import { ReactElement, useMemo, useState } from 'react';
import { FilterTags } from '@/components/filter/tag';
import { IconBaselineDensitySmall } from '@tabler/icons-react';
import { useSearchParams } from 'next/navigation';
import useCurrencyRate from '@/lib/hooks/use-currency-rate';
import { SEPOLIA_AAVE_WETH } from '@/lib/currency';
import { sepolia } from 'viem/chains';
import { formatUnits } from 'viem';
import { Event } from '@/components/tables/activity-table/columns';
import { getRangeInUsd, Range } from '@/lib/hooks/use-range';
import { cn } from '@/lib/utils';
export default function ActivityTable({
	compact,
	data,
	loading,
}: {
	compact: boolean;
	data: Activity[];
	loading?: boolean;
}) {
	const columns = GetActivityColumns(compact);
	return (
		<CustomTable
			columns={columns}
			data={data}
			columnPinningState={{
				left: ['event', 'item'],
			}}
			rowCursor={false}
			className="grow min-h-0 overflow-y-auto pb-4"
			loading={loading}
		/>
	);
}
export function ActivityTableWrapper({
	data,
	loading,
	slots,
	className,
}: {
	data: Activity[];
	loading?: boolean;
	slots?: {
		filter?: ReactElement;
	};
	className?: string;
}) {
	const [compact, setCompact] = useState<boolean>(false);
	return (
		<div className={cn('flex flex-col h-full', className)}>
			<div>
				<nav className="flex items-center mb-4 justify-between">
					{slots?.filter ?? (
						<Filter>
							<ActivityFilterContent />
						</Filter>
					)}
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
				<FilterTags></FilterTags>
			</div>
			<ActivityTable
				data={data}
				compact={compact}
				loading={loading}
			/>
		</div>
	);
}
export function useActivityTableSearchParamsFilterFns() {
	const searchParams = useSearchParams();
	const { data: ethRateData, decimals: ethRateDecimals } = useCurrencyRate({
		erc20TokenAddress: SEPOLIA_AAVE_WETH,
		chainId: sepolia.id,
	});
	const ethRate = useMemo(() => {
		return parseFloat(formatUnits(ethRateData, ethRateDecimals));
	}, [ethRateData, ethRateDecimals]);
	const ret = useMemo(() => {
		return [
			(a) => {
				const status = searchParams.get('activity-status');
				if (status !== null && status !== 'all') {
					const selectedStatus: Event[] = status
						.split(',')
						.map((s) => {
							if (s === 'Listing Canceled') {
								return Event.ListingCanceled;
							} else if (s === 'Item Offer') {
								return Event.Offer;
							} else {
								return Event[s];
							}
						});
					const ret = selectedStatus.includes(a.event);
					return ret;
				} else {
					return true;
				}
			},
			(a) => {
				const chainIds = searchParams.get('chain');
				if (chainIds !== null && chainIds !== 'all') {
					const selectedChainIds: string[] = chainIds.split(',');
					const ret = selectedChainIds.includes(
						a.chainId?.toString() ?? '',
					);
					return ret;
				} else {
					return true;
				}
			},
			(a) => {
				const priceFilter = searchParams.get('price')
					? (JSON.parse(searchParams.get('price')!) as Range<{
							currency: string;
						}>)
					: null;
				if (
					priceFilter &&
					(priceFilter.data.max || priceFilter?.data.min)
				) {
					if (a.price?.usdPrice) {
						const { min, max } = getRangeInUsd(
							priceFilter,
							ethRate,
						);
						return a.price.usdPrice < max && a.price.usdPrice > min;
					} else {
						return false;
					}
				} else {
					return true;
				}
			},
		] as ((act: Activity) => boolean)[];
	}, [searchParams, ethRate]);
	return ret;
}
