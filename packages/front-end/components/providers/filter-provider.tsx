import { createContext, Dispatch, SetStateAction } from 'react';
import { Choice } from '../filter/selection/button-selection';
import { Range } from '@/lib/hooks/use-range';

export const FilterContext = createContext<{
	filterData: FilterData;
	setFilterData: Dispatch<SetStateAction<FilterData>>;
} | null>(null);
export const FilterProvider = FilterContext.Provider;
export type FilterData = {
	selections: Record<string, { data: Choice<any>[]; inited?: boolean }>;
	ranges: Record<string, Range>;
};
