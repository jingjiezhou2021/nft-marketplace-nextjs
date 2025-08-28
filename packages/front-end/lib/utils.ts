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
