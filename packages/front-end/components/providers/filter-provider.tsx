import { createContext, Dispatch, SetStateAction } from 'react';

export const FilterContext = createContext<{
	filterData: FilterData;
	setFilterData: Dispatch<SetStateAction<FilterData>>;
} | null>(null);
export const FilterProvider = FilterContext.Provider;
export type FilterData = {
	selections: Record<string, any>;
	ranges: Record<string, [number, number]>;
};
