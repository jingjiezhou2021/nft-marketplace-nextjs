import { Button } from '@/components/ui/button';
import { useTranslation } from 'next-i18next';
import { EventToString, Event } from './columns';
import {
	BaseCircleColorful,
	EthereumCircleColorful,
} from '@ant-design/web3-icons';
import { PriceFilter } from '../PriceFilter';
import { FilterContent } from '@/components/filter';
import { useState } from 'react';
import ButtonSelection, { Choice } from '@/components/button-selection';
import ChainSelection from '@/components/chain-selection';

export default function ActivityFilterContent() {
	const { t } = useTranslation('common');
	const [statusChoices, setStatusChoices] = useState<Choice<string>[]>([
		{
			value: t('All'),
			label: t('All'),
			selected: false,
		},
		{
			value: EventToString(Event.Sale),
			label: EventToString(Event.Sale),
			selected: false,
		},
		{
			value: EventToString(Event.Transfer),
			label: EventToString(Event.Transfer),
			selected: false,
		},
		{
			value: EventToString(Event.Listing),
			label: EventToString(Event.Listing),
			selected: false,
		},
		{
			value: EventToString(Event.Offer),
			label: EventToString(Event.Offer),
			selected: false,
		},
	]);
	return (
		<FilterContent>
			<h4>{t('Status')}</h4>
			<ButtonSelection
				choices={statusChoices}
				handleToggle={() => {}}
			/>
			<hr />
			<h4>{t('Chains')}</h4>
			<ChainSelection />
			<PriceFilter title={t('Price')} />
		</FilterContent>
	);
}
