import { cn } from '@/lib/utils';
import { IconLoader2, IconProps } from '@tabler/icons-react';

export function LoadingSpinner({ className }: IconProps) {
	return (
		<IconLoader2
			className={cn('text-primary animate-spin', className)}
			size={64}
		/>
	);
}
