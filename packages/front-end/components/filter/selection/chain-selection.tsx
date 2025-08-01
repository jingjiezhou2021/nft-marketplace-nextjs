import { chains } from '../../providers/RainbowKitAllProvider';
import { getIconOfChain, getNameOfChain } from '@/lib/chain';
import ChoiceSelection from '.';
import FilterTag from '../tag';

export default function ChainSelection() {
	return (
		<ChoiceSelection
			name="chain"
			data={chains.map((c) => {
				return {
					value: c.id,
					label: (
						<>
							{getIconOfChain(c.id)}
							{c.name}
						</>
					),
					selected: false,
				};
			})}
			includeAll={true}
			multiple={true}
		/>
	);
}
export function ChainFilterTags({
	name,
	value,
}: {
	name: string;
	value: string;
}) {
	return (
		<>
			{value.split(',').map((cid) => {
				return (
					<FilterTag
						name={name}
						key={cid}
						value={cid}
					>
						{getIconOfChain(cid)}&nbsp;{getNameOfChain(cid)}
					</FilterTag>
				);
			})}
		</>
	);
}
