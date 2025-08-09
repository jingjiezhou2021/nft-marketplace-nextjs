import { cn } from '@/lib/utils';
import { IconEdit } from '@tabler/icons-react';
import { ChangeEventHandler, useRef } from 'react';

export default function ImageUpload({
	children,
	handleChange,
	className,
	iconSize = 24,
}: React.ComponentProps<'button'> & {
	handleChange: ChangeEventHandler<HTMLInputElement>;
	iconSize?: number;
}) {
	const inputRef = useRef<HTMLInputElement>(null);
	return (
		<button
			className={cn(
				'disabled:pointer-events-none  overflow-hidden rounded-t  group relative cursor-pointer',
				className,
			)}
			onClick={() => {
				inputRef.current?.click();
			}}
			type="button"
		>
			{children}
			<IconEdit
				className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white"
				size={iconSize}
			></IconEdit>
			<input
				accept="image/*"
				type="file"
				ref={inputRef}
				className="invisible"
				onChange={handleChange}
			></input>
		</button>
	);
}
