import { cn } from '@/lib/utils';
import React, { ReactNode } from 'react';

export default function BlurryBackground({
	children,
	bg,
	...props
}: React.ComponentProps<'div'> & { bg: ReactNode }) {
	return (
		<div
			{...props}
			className={cn(
				'relative w-full rounded-xl overflow-hidden text-primary-foreground',
				props.className,
			)}
		>
			<div className="w-full relative z-20 p-6">{children}</div>
			<div className="absolute bg-black/50 backdrop-blur-md inset-0 z-10 rounded-xl overflow-hidden"></div>
			<div className="absolute size-full inset-0">{bg}</div>
		</div>
	);
}
