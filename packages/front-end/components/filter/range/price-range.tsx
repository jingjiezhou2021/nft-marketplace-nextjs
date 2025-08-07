import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../../ui/select';
import { Input } from '../../ui/input';
import { useTranslation } from 'next-i18next';
import { CollapsibleFilter } from '..';
import { produce } from 'immer';
import { RangeContext } from '../../providers/range-provider';
import { Context, useContext, useEffect, useState } from 'react';
import { RangeWrapper } from '.';
import useRange from '@/hooks/use-range';
import { cn } from '@/lib/utils';

function PriceRangeInner({ title }: { title: string }) {
	const { t } = useTranslation('common');
	const defaultCurrency = 'ETH';
	const [range, setRange, handleChange] = useContext(
		RangeContext as Context<
			ReturnType<typeof useRange<{ currency: string }>>
		>,
	);
	const [validationErr, setValidationErr] = useState<string | null>(null);
	useEffect(() => {
		const newRange = produce((draft) => {
			draft.meta = { currency: defaultCurrency };
			return draft;
		}, range);
		setRange(newRange);
	}, []);
	useEffect(() => {
		if (range.data.min < 0 || range.data.max < 0) {
			setValidationErr(t('Range values should be positive'));
		} else if (
			range.data.min !== null &&
			range.data.max !== null &&
			range.data.min >= range.data.max
		) {
			setValidationErr(
				t('The min value should have been smaller than the max value'),
			);
		} else {
			setValidationErr(null);
		}
	}, [range, t]);
	return (
		<CollapsibleFilter title={title}>
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
			<div className="flex items-center">
				<Input
					type="number"
					placeholder={t('Min')}
					onChange={(e) => {
						const { value } = e.target;
						const n = value !== '' ? parseFloat(value) : null;
						handleChange('min', n);
					}}
					defaultValue={range.data.min}
					className={cn(validationErr && 'border-destructive')}
				></Input>
				<span className="mx-3 text-sm">{t('to')}</span>
				<Input
					type="number"
					placeholder={t('Max')}
					onChange={(e) => {
						const { value } = e.target;
						const n = value !== '' ? parseFloat(value) : null;
						handleChange('max', n);
					}}
					defaultValue={range.data.max}
					className={cn(validationErr && 'border-destructive')}
				></Input>
			</div>
			<p className="my-1 text-destructive">{validationErr}</p>
		</CollapsibleFilter>
	);
}

export function PriceRange({ title, name }: { title: string; name: string }) {
	return (
		<RangeWrapper name={name}>
			<PriceRangeInner title={title} />
		</RangeWrapper>
	);
}
export const PRICE = 'price';
export const FLOOR_PRICE = 'floor-price';
export const TOP_OFFER = 'top-offer';
