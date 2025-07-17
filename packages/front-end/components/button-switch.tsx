import { ReactNode, useState } from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

export default function ButtonSwitch({
	buttons,
	choice,
}: {
	buttons: { content: ReactNode; clickCb: () => void }[];
	choice: number;
}) {
	return (
		<div className="rounded-md overflow-hidden flex bg-border">
			{buttons.map((b, index) => {
				return (
					<Button
						key={index}
						className={cn(
							'bg-transparent text-muted-foreground border-0  grow transition-colors duration-300 py-0.5 px-2! h-auto hover:bg-transparent hover:text-foreground',
							index === choice &&
								'bg-primary text-primary-foreground rounded-md hover:bg-primary hover:text-primary-foreground',
						)}
						onClick={b.clickCb}
					>
						{b.content}
					</Button>
				);
			})}
		</div>
	);
}
