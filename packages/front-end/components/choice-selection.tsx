import useChoices from '@/hooks/use-choices';
import ButtonSelection, { Choice } from './button-selection';
import { useContext, useEffect } from 'react';
import { FilterContext } from './providers/filter-provider';
import { produce } from 'immer';

export default function ChoiceSelection<T>({
	data,
	name,
	includeAll,
	multiple,
}: {
	data: Choice<T>[];
	name: string;
	includeAll?: boolean;
	multiple?: boolean;
}) {
	const { filterData, setFilterData } = useContext(FilterContext);
	const [choices, setChoices, handleToggle] = useChoices({
		includeAll,
		multiple,
		data,
	});
	useEffect(() => {
		console.log('add choices to filter data:', choices);
		setFilterData(
			produce((draft) => {
				draft.selections = {
					...draft.selections,
					[name]: choices.data,
				};
				return draft;
			}, filterData),
		);
	}, [choices]);
	useEffect(() => {
		if (filterData.selections[name] && filterData.inited) {
			console.log(
				'filter data changed,reflecting on choices:',
				filterData,
			);
			setChoices(
				produce((draft) => {
					filterData.selections[name].forEach((c) => {
						draft.data.forEach((dc) => {
							if (dc.value === c.value) {
								dc.selected = c.selected;
							}
						});
					});
					return draft;
				}, choices),
			);
		}
	}, [filterData]);
	return (
		<ButtonSelection
			choices={choices.data}
			handleToggle={handleToggle}
		/>
	);
}
