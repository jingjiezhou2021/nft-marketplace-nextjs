import getDateFnsLocale from '@/lib/getDateFnsLocale';
import { cn, getDateDiffStr } from '@/lib/utils';
import { IconArrowUpRight } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';
import { useTranslation } from 'next-i18next';

export default function TimeDisplay({
	time,
	className,
	...props
}: {
	time: Date | string;
} & React.ComponentProps<'div'>) {
	time = new Date(time);
	const [now, setNow] = useState(new Date());
	const { i18n } = useTranslation('common');
	useEffect(() => {
		setTimeout(() => {
			setNow(new Date());
		}, 1000);
	}, [now]);
	return (
		<HoverCard>
			<HoverCardTrigger asChild>
				<div
					className={cn(
						'font-serif flex items-center cursor-pointer',
						className,
					)}
					{...props}
				>
					{getDateDiffStr(now, time, getDateFnsLocale(i18n.language))}
					<IconArrowUpRight className="text-muted-foreground" />
				</div>
			</HoverCardTrigger>
			<HoverCardContent>
				<div>
					<p>{time.toLocaleString()}</p>
				</div>
			</HoverCardContent>
		</HoverCard>
	);
}
