import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistance, Locale } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getDateDiffStr(
	dateLater: Date,
	dateEarlier: Date,
	locale: Locale,
) {
	return formatDistance(dateLater, dateEarlier, {
		addSuffix: true,
		locale,
	});
}

export function chunkArray<T>(arr: T[], size: number): T[][] {
	if (size <= 0) throw new Error('Size must be greater than 0');

	const result: T[][] = [];
	for (let i = 0; i < arr.length; i += size) {
		result.push(arr.slice(i, i + size));
	}
	return result;
}

export function getRanges(
	nums: number[],
	numRanges: number,
): [number, number][] {
	if (nums.length === 0) return [];

	// Get distinct numbers
	const distinct = Array.from(new Set(nums)).sort((a, b) => a - b);

	if (distinct.length <= numRanges) {
		// Return as [n, n] ranges
		return distinct.map((n) => [n, n]);
	}

	const min = distinct[0];
	const max = distinct[distinct.length - 1];
	const step = (max - min) / numRanges;

	const ranges: [number, number][] = [];
	for (let i = 0; i < numRanges; i++) {
		const start = min + i * step;
		const end = i === numRanges - 1 ? max : min + (i + 1) * step;
		ranges.push([start, end]);
	}

	return ranges;
}
