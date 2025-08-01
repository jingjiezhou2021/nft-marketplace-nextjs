import { useTranslation } from 'next-i18next';
import { PriceFilter } from '../PriceFilter';
import { FilterContent } from '@/components/filter';
import ChainSelection from '@/components/filter/selection/chain-selection';
import { ActivitySelection } from '@/components/filter/selection/activity-selection';

export default function ActivityFilterContent() {
	const { t } = useTranslation('common');
	return (
		<FilterContent>
			<h4>{t('Status')}</h4>
			<ActivitySelection />
			<hr />
			<h4>{t('Chains')}</h4>
			<ChainSelection />
			<PriceFilter title={t('Price')} />
		</FilterContent>
	);
}
