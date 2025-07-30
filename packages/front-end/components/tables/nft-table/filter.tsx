import { useTranslation } from 'next-i18next';
import { PriceFilter } from '../PriceFilter';
import { FilterContent } from '@/components/filter';
import { useState } from 'react';
import ButtonSelection, { Choice } from '@/components/button-selection';
import ChainSelection from '@/components/chain-selection';
export default function NFTTableFilterContent() {
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
		<FilterContent>
			<h4>{t('Category')}</h4>
			<ButtonSelection
				choices={categories}
				handleToggle={() => {}}
			/>
			<hr />
			<h4>{t('Chains')}</h4>
			<ChainSelection />
			<PriceFilter title={t('Floor Price')} />
			<PriceFilter title={t('Top Offer')} />
		</FilterContent>
	);
}
