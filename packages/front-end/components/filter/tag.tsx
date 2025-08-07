import { ReactNode } from 'react';
import { Button } from '../ui/button';
import { IconX } from '@tabler/icons-react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { cn } from '@/lib/utils';
import { CHAIN, ChainFilterTags } from './selection/chain-selection';
import { PriceFilterTags } from './range';
import { ALL } from '.';
import { FLOOR_PRICE, PRICE, TOP_OFFER } from './range/price-range';

function FilterTagButton({
	className,
	children,
	name,
	value,
	onClick,
}: React.ComponentProps<typeof Button>) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const pathname = usePathname();
	return (
		<Button
			variant="secondary"
			className={(cn(className), 'gap-1')}
			onClick={
				onClick
					? onClick
					: () => {
							const arr = searchParams.get(name).split(',');
							arr.splice(
								arr.findIndex((val) => val === value),
								1,
							);
							const newSearchParams = new URLSearchParams(
								searchParams,
							);
							if (arr.length) {
								newSearchParams.set(name, arr.join(','));
							} else {
								newSearchParams.delete(name);
							}
							router.push({
								pathname,
								search: newSearchParams.toString(),
							});
						}
			}
		>
			{children}
			&nbsp; <IconX />
		</Button>
	);
}
export default function FilterTag({
	children,
	name,
	value,
	onClick,
}: (
	| { children?: undefined; value?: undefined }
	| {
			children: ReactNode;
			value: string;
	  }
) & { name: string; onClick?: () => void }) {
	const { t } = useTranslation();
	const searchParams = useSearchParams();
	if (children && value) {
		return (
			<FilterTagButton
				name={name}
				value={value as string}
				onClick={onClick}
			>
				{children}
			</FilterTagButton>
		);
	} else {
		const vals = searchParams.get(name);
		return (
			<>
				{vals.split(',').map((val) => {
					return (
						<FilterTagButton
							name={name}
							key={val}
							value={val}
							onClick={onClick}
						>
							{t(val)}
						</FilterTagButton>
					);
				})}
			</>
		);
	}
}

export function FilterTags() {
	const searchParams = useSearchParams();
	return (
		<div className="flex gap-2 flex-wrap mb-2">
			{Array.from(searchParams.entries()).map((e) => {
				if (e[1] === ALL) {
					return null;
				}
				if (
					e[0] === FLOOR_PRICE ||
					e[0] === TOP_OFFER ||
					e[0] === PRICE
				) {
					return (
						<PriceFilterTags
							name={e[0]}
							value={e[1]}
							key={e[0]}
						/>
					);
				} else if (e[0] === CHAIN) {
					return (
						<ChainFilterTags
							key="chain-filter-tags"
							name={e[0]}
							value={e[1]}
						/>
					);
				} else {
					return (
						<FilterTag
							name={e[0]}
							key={e[1]}
						></FilterTag>
					);
				}
			})}
		</div>
	);
}
