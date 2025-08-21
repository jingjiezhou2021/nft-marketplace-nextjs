import { Address } from '@ant-design/web3';
import { Badge } from './ui/badge';

export default function AddressBadge({ address }: { address: `0x${string}` }) {
	return (
		<Badge
			variant="outline"
			className="border-border bg-[oklch(var(--muted-foreground)_/_0.5)]"
		>
			<Address
				ellipsis
				address={address}
				className="font-light! leading-tight! text-secondary-foreground! text-xs! select-text opacity-100"
			/>
		</Badge>
	);
}
