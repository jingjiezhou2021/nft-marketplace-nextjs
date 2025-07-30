import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../ui/select';
import { Input } from '../ui/input';
import { useTranslation } from 'next-i18next';
import { CollapsibleFilter } from '../filter';

export function PriceFilter({ title }: { title: string }) {
	const { t } = useTranslation('common');
	return (
		<CollapsibleFilter title={title}>
			<Select defaultValue="ETH">
				<SelectTrigger className="w-full group">
					<SelectValue></SelectValue>
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="ETH">ETH</SelectItem>
					<SelectItem value="USD">USD</SelectItem>
				</SelectContent>
			</Select>
			<div className="flex items-center">
				<Input placeholder={t('Min')}></Input>
				<span className="mx-3 text-sm">{t('to')}</span>
				<Input placeholder={t('Max')}></Input>
			</div>
		</CollapsibleFilter>
	);
}
