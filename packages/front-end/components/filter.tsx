import { ReactNode, useState } from 'react';
import { Drawer, DrawerClose, DrawerContent, DrawerTrigger } from './ui/drawer';
import { Button } from './ui/button';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from './ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { IconFilter2 } from '@tabler/icons-react';
export function Filter({
	children,
	...props
}: React.ComponentProps<typeof Drawer>) {
	return (
		<Drawer {...props}>
			<DrawerTrigger asChild>
				<Button
					className="-ml-3"
					variant="outline"
				>
					<IconFilter2 />
				</Button>
			</DrawerTrigger>
			<DrawerContent>{children}</DrawerContent>
		</Drawer>
	);
}

export function FilterContent({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	const { t } = useTranslation('common');
	return (
		<div
			className={cn(
				'p-6 flex flex-col gap-4 relative overflow-y-auto',
				className,
			)}
		>
			{children}
			<div className="flex justify-between sticky bottom-0  bg-background">
				<DrawerClose asChild>
					<Button
						variant="outline"
						className="w-[49%]"
					>
						{t('Clear All')}
					</Button>
				</DrawerClose>
				<DrawerClose asChild>
					<Button className="w-[49%]">{t('Done')}</Button>
				</DrawerClose>
			</div>
		</div>
	);
}
export function CollapsibleFilter({
	title,
	children,
}: {
	title: string;
	children: ReactNode;
}) {
	const [open, setOpen] = useState(false);
	return (
		<Collapsible
			open={open}
			onOpenChange={setOpen}
		>
			<CollapsibleTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="w-full justify-between text-base font-normal hover:bg-transparent!"
				>
					{title}
					<ChevronDown
						className={cn(
							open && 'rotate-180',
							'transition-transform ease-in-out duration-200',
						)}
					/>
				</Button>
			</CollapsibleTrigger>
			<CollapsibleContent className="flex flex-col gap-4 py-3">
				{children}
			</CollapsibleContent>
		</Collapsible>
	);
}
