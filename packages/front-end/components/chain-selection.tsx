import ButtonSelection from './button-selection';
import { chains } from './providers/RainbowKitAllProvider';
import { getIconOfChain } from '@/lib/chain';
import useChoices from '@/hooks/use-choices';

export default function ChainSelection() {
	const [chainChoices, setChainChoices, handleToggle] = useChoices({
		data: chains.map((c) => {
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
		includeAll: true,
		mutiple: true,
	});
	return (
		<ButtonSelection
			choices={chainChoices}
			handleToggle={handleToggle}
		/>
	);
}
