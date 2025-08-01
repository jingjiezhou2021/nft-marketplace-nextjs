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
import { Context, useContext, useEffect } from 'react';
import { RangeWrapper } from '.';
import useRange from '@/hooks/use-range';

function PriceRangeInner({ title }: { title: string }) {
	const { t } = useTranslation('common');
	const defaultCurrency = 'ETH';
	const [range, setRange, handleChange] = useContext(
		RangeContext as Context<
			ReturnType<typeof useRange<{ currency: string }>>
		>,
	);
	useEffect(() => {
		const newRange = produce((draft) => {
			draft.meta = { currency: defaultCurrency };
			return draft;
		}, range);
		setRange(newRange);
	}, []);
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
					placeholder={t('Min')}
					onChange={(e) => {
						const { value } = e.target;
						const n = value !== '' ? parseFloat(value) : null;
						handleChange('min', n);
					}}
					defaultValue={range.data.min}
				></Input>
				<span className="mx-3 text-sm">{t('to')}</span>
				<Input
					placeholder={t('Max')}
					onChange={(e) => {
						const { value } = e.target;
						const n = value !== '' ? parseFloat(value) : null;
						handleChange('max', n);
					}}
					defaultValue={range.data.max}
				></Input>
			</div>
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
