import { CHAIN_CURRENCY_ADDRESS, getCryptoIcon } from '@/lib/currency';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './ui/select';
import { useTranslation } from 'next-i18next';
import { ChainIdParameter } from '@wagmi/core/internal';
import { config } from './providers/RainbowKitAllProvider';
import { cn } from '@/lib/utils';
export default function SelectCrypto({
	chainId,
	className,
	...props
}: React.ComponentProps<typeof Select> & {
	chainId: ChainIdParameter<typeof config>['chainId'];
	className?: string;
}) {
	const { t } = useTranslation('common');
	if (chainId === undefined) {
		return null;
	}
	return (
		<Select {...props}>
			<SelectTrigger
				className={cn('group', className)}
				id="currency"
			>
				<SelectValue
					placeholder={t(
						'Please select the currency you wanna trade with this item',
					)}
				/>
			</SelectTrigger>
			<SelectContent>
				{Object.entries(CHAIN_CURRENCY_ADDRESS[chainId]).map((e) => {
					return (
						<SelectItem
							value={e[1]}
							key={e[1]}
						>
							{getCryptoIcon(chainId, e[1])}
							{e[0] === 'WETH' ? 'ETH' : e[0]}
						</SelectItem>
					);
				})}
			</SelectContent>
		</Select>
	);
}
