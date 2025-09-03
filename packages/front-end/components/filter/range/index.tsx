import { FilterContext } from '@/components/providers/filter-provider';
import {
	RangeContext,
	RangeProvider,
} from '@/components/providers/range-provider';
import useRange, { Range } from '@/lib/hooks/use-range';
import { produce } from 'immer';
import { ReactNode, useContext, useEffect, useState } from 'react';
import FilterTag from '../tag';
import { IconMathEqualGreater, IconMathEqualLower } from '@tabler/icons-react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { CollapsibleFilter } from '..';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
export function RangeWrapper({
	name,
	children,
}: {
	name: string;
	children: ReactNode;
}) {
	const [range, setRange, handleChange] = useRange();
	const context = useContext(FilterContext);
	if (context === null) {
		throw new Error('RangeWrapper should be inside filter context');
	}
	const filterData = context.filterData;
	const setFilterData = context.setFilterData;
	useEffect(() => {
		console.log('adding range to filter data:', range);
		setFilterData(
			produce((draft) => {
				draft.ranges = {
					...draft.ranges,
					[name]: range,
				};
				return draft;
			}, filterData),
		);
	}, [range]);
	useEffect(() => {
		if (filterData.ranges[name] && filterData.ranges[name].inited) {
			console.log(
				'filter data changed,reflecting on ranges:',
				filterData,
			);
			setRange(filterData.ranges[name]);
		}
	}, [filterData]);
	return (
		<RangeProvider value={[range, setRange, handleChange]}>
			{children}
		</RangeProvider>
	);
}
function SimpleRangeInner({
	title,
	children,
}: {
	title: string;
	children?: ReactNode;
}) {
	const { t } = useTranslation('filter');
	const [validationErr, setValidationErr] = useState<string | null>(null);
	const context = useContext(RangeContext);
	if (context === null) {
		throw new Error('range should be inside filter context');
	}
	const [range, _, handleChange] = context;
	useEffect(() => {
		if (
			(range.data.min !== null && range.data.min < 0) ||
			(range.data.max !== null && range.data.max < 0)
		) {
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
			{children}
			<div className="flex items-center">
				<Input
					type="number"
					placeholder={t('Min')}
					onChange={(e) => {
						const { value } = e.target;
						const n = value !== '' ? parseFloat(value) : null;
						handleChange('min', n);
					}}
					defaultValue={range.data.min ?? undefined}
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
					defaultValue={range.data.max ?? undefined}
					className={cn(validationErr && 'border-destructive')}
				></Input>
			</div>
			<p className="my-1 text-destructive">{validationErr}</p>
		</CollapsibleFilter>
	);
}
export function SimpleRange({
	title,
	name,
	children,
}: {
	title: string;
	name: string;
	children?: ReactNode;
}) {
	return (
		<RangeWrapper name={name}>
			<SimpleRangeInner title={title}>{children}</SimpleRangeInner>
		</RangeWrapper>
	);
}

export function RangeFilterTagInner({
	min,
	max,
	children,
}: {
	min: number | null;
	max: number | null;
	children?: ReactNode;
}) {
	if (min || max) {
		let ret: ReactNode = null;
		if (min && max) {
			ret = (
				<>
					{min}-{max} {children}
				</>
			);
		} else if (min) {
			ret = (
				<>
					{min} {children}
					<IconMathEqualGreater />
				</>
			);
		} else {
			ret = (
				<>
					<IconMathEqualLower /> {max} {children}
				</>
			);
		}
		return ret;
	} else {
		return null;
	}
}

export function PriceFilterTags({
	name,
	value,
}: {
	name: string;
	value: string;
}) {
	const { t } = useTranslation('filter');
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();
	const label = t(
		name
			.split('-')
			.map((word) => {
				return (
					String(word).charAt(0).toUpperCase() + String(word).slice(1)
				);
			})
			.join(' '),
	);
	const range: Range = JSON.parse(value);
	if (range.data.min || range.data.max) {
		return (
			<FilterTag
				name={name}
				value={value}
				onClick={() => {
					const newSearchParams = new URLSearchParams(searchParams);
					newSearchParams.delete(name);
					router.push(
						{
							pathname,
							search: newSearchParams.toString(),
						},
						undefined,
						{ shallow: true },
					);
				}}
			>
				<span>{label}</span>:&nbsp;
				<RangeFilterTagInner
					min={range.data.min}
					max={range.data.max}
				>
					{range.meta?.currency}
				</RangeFilterTagInner>
			</FilterTag>
		);
	} else {
		return null;
	}
}
