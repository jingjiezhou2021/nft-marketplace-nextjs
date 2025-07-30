import { useState } from 'react';
import ButtonSelection, { Choice } from './button-selection';
import { useTranslation } from 'react-i18next';

export default function CategorySelection() {
	const { t } = useTranslation('common');
	const [categories, setCategories] = useState<Choice<string>[]>([
		{
			value: t('All'),
			label: t('All'),
			selected: false,
		},
		{
			value: t('Art'),
			label: t('Art'),
			selected: false,
		},
		{
			value: t('Gaming'),
			label: t('Gaming'),
			selected: false,
		},
		{
			value: t('PFPs'),
			label: t('PFPs'),
			selected: false,
		},
		{
			value: t('Photography'),
			label: t('Photography'),
			selected: false,
		},
	]);
	return (
		<ButtonSelection
			choices={categories}
			handleToggle={() => {}}
		/>
	);
}
