import { Choice } from '@/components/filter/selection/button-selection';
import { produce } from 'immer';
import { useTranslation } from 'next-i18next';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
type Choices<T> = {
	data: Choice<T>[];
	inited: boolean;
};
export default function useChoices<T>({
	data,
	includeAll,
	multiple = false,
}: {
	data: Choice<T>[];
	includeAll?: boolean;
	multiple?: boolean;
}): [
	Choices<T>,
	Dispatch<SetStateAction<Choices<T>>>,
	(toggled: Choice<T>) => void,
] {
	const { t } = useTranslation('common');
	const initial = [...data];
	if (includeAll) {
		initial.unshift({
			value: null,
			label: <>{t('All')}</>,
		});
	}
	const [choices, setChoices] = useState<Choices<T>>({
		data: initial,
		inited: false,
	});
	const handleToggle = (toggled: Choice<T>) => {
		const newChoices = produce((draft) => {
			if (multiple) {
				if (toggled.value === null) {
					if (!toggled.selected) {
						draft.data.forEach((choice) => {
							if (choice.value === null) {
								choice.selected = true;
							} else {
								choice.selected = false;
							}
						});
					}
				} else {
					draft.data.forEach((choice) => {
						if (choice.value === toggled.value) {
							choice.selected = !choice.selected;
						}
					});
					const selectedCountAfterToggle = draft.data.filter(
						(choice) => choice.selected,
					).length;
					const t = draft.data.find(
						(choice) => choice.value === null,
					);
					if (t !== undefined) {
						if (selectedCountAfterToggle === 0) {
							t.selected = true;
						} else if (selectedCountAfterToggle > 1) {
							t.selected = false;
						}
					}
				}
			} else {
				draft.data.forEach((choice) => {
					choice.selected = choice.value === toggled.value;
				});
			}
		}, choices);
		setChoices(newChoices);
	};
	return [choices, setChoices, handleToggle];
}
