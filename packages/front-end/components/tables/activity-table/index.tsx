import CustomTable from '../custom-table';
import GetActivityColumns, { Activity } from './columns';
export default function ActivityTable({
	compact,
	data,
}: {
	compact: boolean;
	data: Activity[];
}) {
	const columns = GetActivityColumns(compact);
	return (
		<CustomTable
			columns={columns}
			data={data}
			columnPinningState={{
				left: ['event', 'item'],
			}}
			rowCursor={false}
			className="grow min-h-0 overflow-y-auto pb-4"
		/>
	);
}
