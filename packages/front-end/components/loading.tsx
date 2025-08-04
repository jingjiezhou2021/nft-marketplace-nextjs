import { cn } from '@/lib/utils';
import { IconLoader2, IconProps } from '@tabler/icons-react';
import { ReactNode, useRef } from 'react';
import { Transition } from 'react-transition-group';

export function LoadingSpinner({ className, size = 64 }: IconProps) {
	return (
		<IconLoader2
			className={cn('text-primary animate-spin', className)}
			size={size}
		/>
	);
}

export function LoadingMask({
	className,
	loading,
	children,
}: {
	className?: string;
	loading: boolean;
	children?: ReactNode;
}) {
	const maskRef = useRef<HTMLDivElement>(null);
	return (
		<Transition
			nodeRef={maskRef}
			in={loading}
			timeout={300}
			unmountOnExit={true}
			appear={true}
		>
			{(state) => (
				<div
					ref={maskRef}
					className={cn(
						'absolute size-full bg-background opacity-0 transition-opacity ease-in-out duration-300 z-20',
						state === 'entering' && 'opacity-80',
						state === 'entered' && 'opacity-80',
						state === 'exiting' && 'opacity-0',
						state === 'exited' && 'opacity-0',
						className,
					)}
				>
					{children}
				</div>
			)}
		</Transition>
	);
}
