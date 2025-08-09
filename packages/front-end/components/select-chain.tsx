import { getIconOfChain } from '@/lib/chain';
import { chains } from './providers/RainbowKitAllProvider';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './ui/select';
import { useTranslation } from 'next-i18next';
export default function SelectChain({
	...props
}: React.ComponentProps<typeof Select>) {
	const { t } = useTranslation('common');
	return (
		<Select {...props}>
			<SelectTrigger
				className={'w-full group'}
				id="chain"
			>
				<SelectValue
					placeholder={t(
						'Select the chain where NFT contract resides',
					)}
				/>
			</SelectTrigger>
			<SelectContent>
				{chains.map((c) => {
					return (
						<SelectItem
							value={c.id.toString()}
							key={c.id}
						>
							{getIconOfChain(c.id)}
							{c.name}
						</SelectItem>
					);
				})}
			</SelectContent>
		</Select>
	);
}
