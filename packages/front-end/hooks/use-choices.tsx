import { Choice } from '@/components/button-selection';
import { produce } from 'immer';
import { useTranslation } from 'next-i18next';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

export default function useChoices<T>({
	data,
	includeAll,
	mutiple = false,
}: {
	data: Choice<T>[];
	includeAll?: boolean;
	mutiple?: boolean;
}): [
	Choice<T>[],
	Dispatch<SetStateAction<Choice<T>[]>>,
	(toggled: Choice<T>) => void,
] {
	const { t } = useTranslation('common');
	if (includeAll) {
		data.unshift({
			value: null,
			label: <>{t('All')}</>,
			selected: true,
		});
	}
	const [choices, setChoices] = useState(data);
	useEffect(() => {
		if (mutiple) {
			if (
				choices.every((c) => {
					return !c.selected;
				})
			) {
				const newChoices = produce((draft) => {
					draft.forEach((c) => {
						if (c.value === null) {
							c.selected = true;
						}
					});
					return draft;
				}, choices);
				setChoices(newChoices);
			}
		}
	}, [choices, mutiple]);
	const handleToggle = (toggled: Choice<T>) => {
		if (mutiple) {
			if (toggled.value === null) {
				if (!toggled.selected) {
					//select all chains
					setChoices((previous) => {
						return previous.map((choice) => {
							return {
								...choice,
								selected: choice.value === null,
							};
						});
					});
				}
			} else {
				const newChoices = produce((draft) => {
					draft.forEach((choice) => {
						if (choice.value === toggled.value) {
							choice.selected = !choice.selected;
						} else {
							if (choice.value === null) {
								choice.selected = false;
							}
						}
					});
				}, choices);
				setChoices(newChoices);
			}
		} else {
			const newChoices = produce((draft) => {
				draft.forEach((choice) => {
					choice.selected = choice.value === toggled.value;
				});
			}, choices);
			setChoices(newChoices);
		}
	};
	return [choices, setChoices, handleToggle];
}
