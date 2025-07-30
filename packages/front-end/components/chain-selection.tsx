import { useState } from 'react';
import ButtonSelection, { Choice } from './button-selection';
import { chains } from './providers/RainbowKitAllProvider';
import { getIconOfChain } from '@/lib/chain';

export default function ChainSelection() {
	const [chainChoices, setChainChoices] = useState<Choice<number>[]>(
		chains.map((c) => {
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
		}),
	);
	return (
		<ButtonSelection
			choices={chainChoices}
			handleToggle={() => {}}
		/>
	);
}
