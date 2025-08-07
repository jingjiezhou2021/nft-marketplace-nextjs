import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../../ui/select';
import { produce } from 'immer';
import { RangeContext } from '../../providers/range-provider';
import { Context, useContext, useEffect } from 'react';
import { SimpleRange } from '.';
import useRange from '@/hooks/use-range';

function PriceRangeInner() {
	const defaultCurrency = 'ETH';
	const [range, setRange] = useContext(
		RangeContext as unknown as Context<
			ReturnType<typeof useRange<{ currency: string }>>
		>,
	);
	useEffect(() => {
		const newRange = produce((draft) => {
			if (draft.meta?.currency === '' || !draft.meta?.currency) {
				draft.meta = { currency: defaultCurrency };
			}
			return draft;
		}, range);
		setRange(newRange);
	}, []);
	return (
		<Select
			defaultValue={range.meta?.currency ?? defaultCurrency}
			onValueChange={(val) => {
				console.log('currency changed:', val);
				const newRange = produce((draft) => {
					draft.meta = { currency: val };
					return draft;
				}, range);
				setRange(newRange);
			}}
		>
			<SelectTrigger className="w-full group">
				<SelectValue></SelectValue>
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="ETH">ETH</SelectItem>
				<SelectItem value="USD">USD</SelectItem>
			</SelectContent>
		</Select>
	);
}

export function PriceRange({ title, name }: { title: string; name: string }) {
	return (
		<SimpleRange
			title={title}
			name={name}
		>
			<PriceRangeInner></PriceRangeInner>
		</SimpleRange>
	);
}

export const PRICE = 'price';
export const FLOOR_PRICE = 'floor-price';
export const TOP_OFFER = 'top-offer';
