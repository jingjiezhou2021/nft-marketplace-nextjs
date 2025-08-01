import ChoiceSelection from '.';
import { EventToString, Event } from '../../tables/activity-table/columns';

export function ActivitySelection() {
	return (
		<ChoiceSelection
			includeAll
			multiple
			name="activity-status"
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
