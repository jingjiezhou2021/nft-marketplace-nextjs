import { createContext, Dispatch, SetStateAction } from 'react';
import { Choice } from '../filter/selection/button-selection';
import { Range } from '@/hooks/use-range';

export const FilterContext = createContext<{
	filterData: FilterData;
	setFilterData: Dispatch<SetStateAction<FilterData>>;
} | null>(null);
export const FilterProvider = FilterContext.Provider;
export type FilterData = {
	selections: Record<string, Choice<any>[]>;
	ranges: Record<string, Range>;
	inited: boolean;
};
