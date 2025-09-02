import { ReactNode, useEffect, useState } from 'react';
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '../ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { IconFilter2 } from '@tabler/icons-react';
import { FilterData, FilterProvider } from '../providers/filter-provider';
import { useRouter } from 'next/router';
import { usePathname, useSearchParams } from 'next/navigation';
import { produce } from 'immer';
import { Range } from '@/lib/hooks/use-range';
import { useTranslation } from 'next-i18next';
export function Filter({
	children,
	...props
}: React.ComponentProps<typeof Drawer>) {
	return (
		<Drawer {...props}>
			<DrawerTrigger asChild>
				<Button variant="outline">
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
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const { t } = useTranslation('common');
	const [filterData, setFilterData] = useState<FilterData>({
		selections: {},
		ranges: {},
	});
	useEffect(() => {
		console.log('search params have changed:', searchParams);
		searchParams.entries().forEach((val) => {
			const name = val[0];
			if (filterData.selections[name]) {
				if (!filterData.selections[name].inited) {
					const selectedValues = val[1].split(',');
					const newFilterData = produce((draft) => {
						selectedValues.forEach((sv: string | null) => {
							if (sv === ALL) {
								sv = null;
							}
							const target = draft.selections[name].data.find(
								(c) => c.value == sv,
							);
							if (target) {
								target.selected = true;
							}
						});
						draft.selections[name].inited = true;
						return draft;
					}, filterData);
					setFilterData(newFilterData);
				}
			} else if (filterData.ranges[name]) {
				if (!filterData.ranges[name].inited) {
					const rangeValue: Range = JSON.parse(val[1]);
					const newFilterData = produce((draft) => {
						draft.ranges[name] = rangeValue;
						draft.ranges[name].inited = true;
						return draft;
					}, filterData);
					setFilterData(newFilterData);
				}
			}
		});
	}, [searchParams, filterData]);
	return (
		<FilterProvider value={{ filterData, setFilterData }}>
			<div className={cn('flex flex-col grow min-h-0 pb-6', className)}>
				<div className="flex flex-col gap-4 overflow-y-auto grow min-h-0 px-6">
					{children}
				</div>
				<div className="flex justify-between  bg-background px-6">
					<DrawerClose asChild>
						<Button
							variant="outline"
							className="w-[49%]"
							onClick={() => {
								console.log('filter cleared');
								router.push(
									{ pathname, search: '' },
									undefined,
									{ shallow: true },
								);
							}}
						>
							{t('Clear All')}
						</Button>
					</DrawerClose>
					<DrawerClose asChild>
						<Button
							className="w-[49%]"
							disabled={
								Object.values(filterData.ranges).filter((r) => {
									return (
										(r.data.min !== null &&
											r.data.max !== null &&
											r.data.min >= r.data.max) ||
										(r.data.min !== null &&
											r.data.min < 0) ||
										(r.data.max !== null && r.data.max < 0)
									);
								}).length > 0
							}
							onClick={() => {
								console.log('filter done');
								router.push(
									{
										pathname: pathname,
										search: `?${transformFilterData2QueryString(filterData)}`,
									},
									undefined,
									{ shallow: true },
								);
							}}
						>
							{t('Done')}
						</Button>
					</DrawerClose>
				</div>
			</div>
		</FilterProvider>
	);
}

export function transformFilterData2QueryString(filterData: FilterData) {
	const params = new URLSearchParams();

	// Handle selections
	for (const [key, choices] of Object.entries(filterData.selections)) {
		const selectedValues = choices.data
			.filter((choice) => choice.selected)
			.map((choice) => (choice.value === null ? ALL : choice.value));

		if (selectedValues.length > 0) {
			params.set(key, selectedValues.join(',')); // e.g. color=red,blue
		}
	}

	// Handle ranges
	for (const [key, range] of Object.entries(filterData.ranges)) {
		if (range) {
			params.set(key, JSON.stringify(range)); // e.g. price=100-500
		}
	}

	return params.toString(); // returns something like "color=red&size=L&price=100-500"
}

export function CollapsibleFilter({
	title,
	children,
	defaultOpen = false,
}: {
	title: string;
	children: ReactNode;
	defaultOpen?: boolean;
}) {
	const [open, setOpen] = useState(!!defaultOpen);
	return (
		<Collapsible
			open={open}
			onOpenChange={setOpen}
			defaultOpen={defaultOpen}
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
export const ALL = 'all';
