import { useTranslation } from 'next-i18next';
import { PriceFilter } from '../PriceFilter';
import { FilterContent } from '@/components/filter';
import ChainSelection from '@/components/chain-selection';
import CategorySelection from '@/components/category-selection';
export default function NFTTableFilterContent() {
	const { t } = useTranslation('common');
	return (
		<FilterContent>
			<h4>{t('Category')}</h4>
			<CategorySelection />
			<hr />
			<h4>{t('Chains')}</h4>
			<ChainSelection />
			<PriceFilter title={t('Floor Price')} />
			<PriceFilter title={t('Top Offer')} />
		</FilterContent>
	);
}
