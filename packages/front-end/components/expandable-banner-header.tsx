import { cn } from '@/lib/utils';
import { Dispatch, ReactElement, SetStateAction, useState } from 'react';
import { Button } from './ui/button';
import {
	IconArrowsDiagonal,
	IconArrowsDiagonalMinimize2,
} from '@tabler/icons-react';

export function ExpandableBannerHeaderContent({
	children,
	className,
}: React.ComponentProps<'div'>) {
	return (
		<div
			className={cn(
				'flex w-full min-w-0 flex-col pb-4 lg:grid lg:grid-cols-[1fr_auto] lg:items-end lg:justify-between xl:gap-4 xl:pb-5 relative z-30',
				className,
			)}
		>
			{children}
		</div>
	);
}

export function ExpandableBannerHeaderContentLeft({
	children,
	className,
}: React.ComponentProps<'div'>) {
	return (
		<div className={cn('flex flex-col gap-1 md:gap-4', className)}>
			{children}
		</div>
	);
}

export function ExpandableBannerHeaderContentRight({
	children,
	className,
}: React.ComponentProps<'div'>) {
	return (
		<div
			className={cn(
				'pt-2 flex justify-between gap-6 md:gap-8',
				className,
			)}
		>
			{children}
		</div>
	);
}

export default function ExpandableBannerHeader({
	children,
	banner,
}: {
	children: (
		expand: boolean,
		expandToggleButton: ReactElement,
	) => ReactElement;
	banner: ReactElement;
}) {
	const [expand, setExpand] = useState<boolean>(true);
	const expandToggleButton = (
		<Button
			variant="outline"
			className="text-foreground hover:text-primary"
			onClick={() => {
				setExpand(!expand);
			}}
		>
			{expand ? <IconArrowsDiagonalMinimize2 /> : <IconArrowsDiagonal />}
		</Button>
	);
	return (
		<div className={cn('w-full relative', expand && 'dark')}>
			<div className="mx-auto min-h-0 w-full min-w-0 px-4 lg:px-6">
				<div
					className={cn(
						'pointer-events-auto flex items-end w-full',
						expand
							? 'aspect-12/11 md:aspect-16/9 lg:aspect-8/3 xl:aspect-4/1 xl:max-h-[466px]'
							: 'h-auto',
					)}
				>
					{expand && banner}
					{children(expand, expandToggleButton)}
					{expand && (
						<div className="absolute inset-0 z-20 dark bg-[linear-gradient(180deg,rgb(9_9_11/65%)_0%,rgb(9_9_11/40%)_25%,rgb(9_9_11/35%)_50%,rgb(9_9_11/75%)_75%,rgb(9_9_11)_100%)] ease-out-quint transition-opacity duration-500 opacity-100"></div>
					)}
				</div>
			</div>
		</div>
	);
}
