import { useTranslation } from 'next-i18next';
import { PriceRange } from '../../filter/range/price-range';
import { FilterContent } from '@/components/filter';
import ChainSelection from '@/components/filter/selection/chain-selection';
import CategorySelection from '@/components/filter/selection/category-selection';
export default function NFTTableFilterContent() {
	const { t } = useTranslation('common');
	return (
		<FilterContent>
			<h4>{t('Category')}</h4>
			<CategorySelection />
			<hr />
			<h4>{t('Chains')}</h4>
			<ChainSelection />
			<PriceRange
				title={t('Floor Price')}
				name="floor-price"
			/>
			<PriceRange
				title={t('Top Offer')}
				name="top-offer"
			/>
		</FilterContent>
	);
}
