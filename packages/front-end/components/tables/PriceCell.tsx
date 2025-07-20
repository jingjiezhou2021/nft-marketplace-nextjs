import { formatPrice } from '@/lib/format-price';
import { cn } from '@/lib/utils';

export function PriceCell({
	n,
	className,
}: { n: number | bigint } & React.ComponentProps<'div'>) {
	const formatted = formatPrice(n);
	return (
		<div className={cn('font-light font-mono', className)}>
			{formatted !== '-' && <span>$</span>}
			{formatted}
		</div>
	);
}
