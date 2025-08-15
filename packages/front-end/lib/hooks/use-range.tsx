import { produce } from 'immer';
import { Dispatch, SetStateAction, useState } from 'react';
export type Range<Meta = Record<string, any>> = {
	data: { min: number | null; max: number | null };
	meta: Meta | null;
	inited?: boolean;
};
export default function useRange<
	Meta extends Record<string, any> = Record<string, any>,
>(): [
	Range<Meta>,
	Dispatch<SetStateAction<Range<Meta>>>,
	(which: 'min' | 'max', val: number | null) => void,
] {
	const [range, setRange] = useState<{
		data: { min: number | null; max: number | null };
		meta: Meta | null;
	}>({
		data: {
			min: null,
			max: null,
		},
		meta: null,
	});
	const handleChange = (which: 'min' | 'max', val: number | null) => {
		console.log('range value chanegd:', val);
		const newRange = produce((draft) => {
			draft.data[which] = val;
			return draft;
		}, range);
		setRange(newRange);
	};
	return [range, setRange, handleChange];
}
