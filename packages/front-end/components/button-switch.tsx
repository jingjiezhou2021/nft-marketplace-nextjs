import { ReactNode, useState } from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

export default function ButtonSwitch({ buttons }: { buttons: ReactNode[] }) {
	const [chosen, setChosen] = useState<number>(0);
	return (
		<div className="rounded-md overflow-hidden flex bg-border">
			{buttons.map((b, index) => {
				return (
					<Button
						key={index}
						onClick={() => {
							setChosen(index);
						}}
						className={cn(
							'bg-transparent text-muted-foreground border-0  grow transition-colors duration-300 py-0.5 px-2! h-auto hover:bg-transparent hover:text-foreground',
							index === chosen &&
								'bg-primary text-primary-foreground rounded-md hover:bg-primary hover:text-primary-foreground',
						)}
					>
						{b}
					</Button>
				);
			})}
		</div>
	);
}
