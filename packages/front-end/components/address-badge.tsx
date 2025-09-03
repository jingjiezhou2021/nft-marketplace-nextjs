import { Address } from '@ant-design/web3';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

export default function AddressBadge({
	address,
	className,
	...props
}: { address: `0x${string}` } & React.ComponentProps<typeof Badge>) {
	return (
		<Badge
			variant="outline"
			className={cn(
				'border-border bg-[oklch(var(--muted-foreground)_/_0.5)]',
				className,
			)}
			{...props}
		>
			<Address
				ellipsis
				address={address}
				className="font-light! leading-tight! text-secondary-foreground! text-xs! select-text opacity-100"
			/>
		</Badge>
	);
}
