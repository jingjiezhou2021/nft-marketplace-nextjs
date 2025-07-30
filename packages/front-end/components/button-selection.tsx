import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { ReactNode } from 'react';

export type Choice<T = string> = {
	value: T;
	label: string | ReactNode;
	selected: boolean;
};
export default function ButtonSelection<T>({
	className,
	choices,
	handleToggle,
}: React.ComponentProps<'div'> & {
	choices: Choice<T>[];
	handleToggle: (c: Choice<T>) => void;
}) {
	return (
		<div className={cn('flex flex-wrap gap-2', className)}>
			{choices.map((c, index) => {
				return (
					<Button
						key={index}
						variant="outline"
						onClick={() => {
							handleToggle(c);
						}}
					>
						{c.label}
					</Button>
				);
			})}
		</div>
	);
}
