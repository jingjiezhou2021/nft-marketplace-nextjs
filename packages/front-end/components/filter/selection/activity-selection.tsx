import { useTranslation } from 'next-i18next';
import ChoiceSelection from '.';
import { Event } from '../../tables/activity-table/columns';
const NAME = 'activity-status';
export function EventToString(e: Event, translate: boolean = true) {
	const { t } = useTranslation('filter');
	switch (e) {
		case Event.Listing:
			return translate ? t('Listing') : 'Listing';
		case Event.Transfer:
			return translate ? t('Transfer') : 'Transfer';
		case Event.Offer:
			return translate ? t('Item Offer') : 'Item Offer';
		case Event.Sale:
			return translate ? t('Sale') : 'Sale';
	}
}
export function ActivitySelection() {
	return (
		<ChoiceSelection
			includeAll
			multiple
			name={NAME}
			data={[
				{
					value: EventToString(Event.Sale, false),
					label: EventToString(Event.Sale),
				},
				{
					value: EventToString(Event.Transfer, false),
					label: EventToString(Event.Transfer),
				},
				{
					value: EventToString(Event.Listing, false),
					label: EventToString(Event.Listing),
				},
				{
					value: EventToString(Event.Offer, false),
					label: EventToString(Event.Offer),
				},
			]}
		/>
	);
}
