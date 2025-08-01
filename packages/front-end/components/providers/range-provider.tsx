import useRange from '@/hooks/use-range';
import { createContext } from 'react';

export const RangeContext = createContext<ReturnType<typeof useRange> | null>(
	null,
);
export const RangeProvider = RangeContext.Provider;
