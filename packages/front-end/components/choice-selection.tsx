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
	const [choices, setChoices, handleToggle] = useChoices({
		includeAll,
		multiple,
		data,
	});
	const { filterData, setFilterData } = useContext(FilterContext);
	useEffect(() => {
		setFilterData(
			produce((draft) => {
				draft.selections = {
					...draft.selections,
					[name]: choices,
				};
				return draft;
			}, filterData),
		);
	}, [choices]);
	return (
		<ButtonSelection
			choices={choices}
			handleToggle={handleToggle}
		/>
	);
}
