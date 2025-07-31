import ChoiceSelection from './choice-selection';
import { EventToString, Event } from './tables/activity-table/columns';

export function ActivitySelection() {
	return (
		<ChoiceSelection
			includeAll
			multiple
			name="activity-status"
			data={[
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
			]}
		/>
	);
}
