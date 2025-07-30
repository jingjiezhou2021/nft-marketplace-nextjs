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
import useChoices from '@/hooks/use-choices';

export default function ActivityFilterContent() {
	const { t } = useTranslation('common');
	const [statusChoices, setStatusChoices, handleToggle] = useChoices({
		mutiple: true,
		includeAll: true,
		data: [
			{
				value: EventToString(Event.Sale),
				label: EventToString(Event.Sale),
			},
			{
				value: EventToString(Event.Transfer),
				label: EventToString(Event.Transfer),
			},
			{
				value: EventToString(Event.Listing),
				label: EventToString(Event.Listing),
			},
			{
				value: EventToString(Event.Offer),
				label: EventToString(Event.Offer),
			},
		],
	});
	return (
		<FilterContent>
			<h4>{t('Status')}</h4>
			<ButtonSelection
				choices={statusChoices}
				handleToggle={handleToggle}
			/>
			<hr />
			<h4>{t('Chains')}</h4>
			<ChainSelection />
			<PriceFilter title={t('Price')} />
		</FilterContent>
	);
}
