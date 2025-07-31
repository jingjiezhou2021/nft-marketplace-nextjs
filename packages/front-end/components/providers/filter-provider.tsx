import { createContext, Dispatch, SetStateAction } from 'react';
import { Choice } from '../button-selection';

export const FilterContext = createContext<{
	filterData: FilterData;
	setFilterData: Dispatch<SetStateAction<FilterData>>;
} | null>(null);
export const FilterProvider = FilterContext.Provider;
export type FilterData = {
	selections: Record<string, Choice<any>[]>;
	ranges: Record<string, [number, number]>;
	inited: boolean;
};
