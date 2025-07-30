import { useState } from 'react';
import ButtonSelection, { Choice } from './button-selection';
import { useTranslation } from 'react-i18next';
import useChoices from '@/hooks/use-choices';

export default function CategorySelection() {
	const { t } = useTranslation('common');
	const [categories, setCategories, handleToggle] = useChoices({
		includeAll: true,
		mutiple: true,
		data: [
			{
				value: t('Art'),
				label: t('Art'),
			},
			{
				value: t('Gaming'),
				label: t('Gaming'),
			},
			{
				value: t('PFPs'),
				label: t('PFPs'),
			},
			{
				value: t('Photography'),
				label: t('Photography'),
			},
		],
	});
	return (
		<ButtonSelection
			choices={categories}
			handleToggle={handleToggle}
		/>
	);
}
