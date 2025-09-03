import { cn } from '@/lib/utils';
import { LoadingMask, LoadingSpinner } from './loading';
import { ReactNode } from 'react';

export function Gallery({
	className,
	loading,
	children,
}: {
	className?: string;
	loading?: boolean;
	children?: ReactNode;
}) {
	return (
		<div
			className={cn(
				'grid w-full grid-flow-row-dense gap-3 grid-cols-[repeat(auto-fill,minmax(177px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(172px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(178px,1fr))] xl:grid-cols-[repeat(auto-fill,minmax(186px,1fr))] 2xl:grid-cols-[repeat(auto-fill,minmax(218px,1fr))] relative',
				className,
			)}
		>
			<LoadingMask
				loading={!!loading}
				className="flex justify-center items-center z-30"
			>
				<LoadingSpinner size={64} />
			</LoadingMask>
			{children}
		</div>
	);
}
