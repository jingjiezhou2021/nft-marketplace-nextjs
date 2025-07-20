import { useState } from 'react';
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '../ui/collapsible';
import { Button } from '../ui/button';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../ui/select';
import { Input } from '../ui/input';
import { useTranslation } from 'next-i18next';

export function PriceFilter({ title }: { title: string }) {
	const [open, setOpen] = useState(false);
	const { t } = useTranslation('common');
	return (
		<Collapsible
			open={open}
			onOpenChange={setOpen}
		>
			<CollapsibleTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="w-full justify-between text-base font-normal hover:bg-transparent!"
				>
					{title}
					<ChevronDown
						className={cn(
							open && 'rotate-180',
							'transition-transform ease-in-out duration-200',
						)}
					/>
				</Button>
			</CollapsibleTrigger>
			<CollapsibleContent className="flex flex-col gap-4 py-3">
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
			</CollapsibleContent>
		</Collapsible>
	);
}
