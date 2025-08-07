import { FilterContext } from '@/components/providers/filter-provider';
import { RangeProvider } from '@/components/providers/range-provider';
import useRange, { Range } from '@/hooks/use-range';
import { produce } from 'immer';
import { ReactNode, useContext, useEffect } from 'react';
import FilterTag from '../tag';
import { IconMathEqualGreater, IconMathEqualLower } from '@tabler/icons-react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';

export function RangeWrapper({
	name,
	children,
}: {
	name: string;
	children: ReactNode;
}) {
	const [range, setRange, handleChange] = useRange();
	const context = useContext(FilterContext);
	if (context === null) {
		throw new Error('RangeWrapper should be inside filter context');
	}
	const filterData = context.filterData;
	const setFilterData = context.setFilterData;
	useEffect(() => {
		console.log('adding range to filter data:', range);
		setFilterData(
			produce((draft) => {
				draft.ranges = {
					...draft.ranges,
					[name]: range,
				};
				return draft;
			}, filterData),
		);
	}, [range]);
	useEffect(() => {
		if (filterData.ranges[name] && filterData.inited) {
			console.log(
				'filter data changed,reflecting on ranges:',
				filterData,
			);
			setRange(filterData.ranges[name]);
		}
	}, [filterData]);
	return (
		<RangeProvider value={[range, setRange, handleChange]}>
			{children}
		</RangeProvider>
	);
}
export function PriceFilterTags({
	name,
	value,
}: {
	name: string;
	value: string;
}) {
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();
	const label = name
		.split('-')
		.map((word) => {
			return String(word).charAt(0).toUpperCase() + String(word).slice(1);
		})
		.join(' ');
	const range: Range<{ currency: string }> = JSON.parse(value);
	if (range.data.min || range.data.max) {
		let children = null;
		if (range.data.min && range.data.max) {
			children = (
				<>
					{label}:&nbsp;{range.data.min}-{range.data.max}{' '}
					{range.meta!.currency}
				</>
			);
		} else if (range.data.min) {
			children = (
				<>
					{label}:&nbsp;{range.data.min} {range.meta!.currency}
					<IconMathEqualGreater />
				</>
			);
		} else {
			children = (
				<>
					{label}:&nbsp;
					<IconMathEqualLower /> {range.data.max}{' '}
					{range.meta!.currency}
				</>
			);
		}
		return (
			<FilterTag
				name={name}
				value={value}
				onClick={() => {
					const newSearchParams = new URLSearchParams(searchParams);
					newSearchParams.delete(name);
					router.push(
						{
							pathname,
							search: newSearchParams.toString(),
						},
						undefined,
						{ shallow: true },
					);
				}}
			>
				{children}
			</FilterTag>
		);
	} else {
		return null;
	}
}
