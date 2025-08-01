import { FilterContext } from '@/components/providers/filter-provider';
import { RangeProvider } from '@/components/providers/range-provider';
import useRange from '@/hooks/use-range';
import { produce } from 'immer';
import { ReactNode, useContext, useEffect } from 'react';

export function RangeWrapper({
	name,
	children,
}: {
	name: string;
	children: ReactNode;
}) {
	const [range, setRange, handleChange] = useRange();
	const { filterData, setFilterData } = useContext(FilterContext);
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
