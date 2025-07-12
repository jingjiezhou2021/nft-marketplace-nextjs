import { cn } from '@/lib/utils';
import { Input } from './input';
import { SearchIcon } from 'lucide-react';
export function SearchInput({
	className,
	...props
}: React.ComponentProps<'input'>) {
	return (
		<div className="transition-[color,box-shadow] outline-none w-full flex items-center focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] rounded-md border pr-2">
			<SearchIcon className="pl-3 grow-0 shrink-0" />
			<Input
				className={cn(className, 'w-auto grow')}
				style={{
					border: 'none',
					boxShadow: 'none',
				}}
				{...props}
			></Input>
			<div className="px-2 grow-0 shrink-0 rounded-sm border text-sm py-0.5">
				/
			</div>
		</div>
	);
}
