import ButtonSelection from './button-selection';
import { chains } from '../../providers/RainbowKitAllProvider';
import { getIconOfChain } from '@/lib/chain';
import useChoices from '@/hooks/use-choices';
import ChoiceSelection from '.';

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
