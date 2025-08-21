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
