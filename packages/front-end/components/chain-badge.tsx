import { getIconOfChain, getNameOfChain } from '@/lib/chain';
import { Badge } from './ui/badge';
import { ChainIdParameter } from '@wagmi/core/internal';
import { config } from './providers/RainbowKitAllProvider';

export default function ChainBadge({
	chainId,
	className,
}: {
	chainId: ChainIdParameter<typeof config>['chainId'];
	className?: string;
}) {
	return (
		<Badge
			variant="outline"
			className={className}
		>
			{getIconOfChain(chainId)}&nbsp;
			{getNameOfChain(chainId)}
		</Badge>
	);
}
