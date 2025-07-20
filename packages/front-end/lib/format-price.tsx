export function formatPrice(n: number | bigint): string {
	if (typeof n === 'bigint') {
		n = Number(n);
	}
	if (n === 0) {
		return '-';
	}
	if (n < 1e4) {
		return n.toLocaleString();
	} else if (n < 1e6) {
		return `${(n / 1e3).toFixed(1)}K`;
	} else if (n < 1e9) {
		return `${(n / 1e6).toFixed(1)}M`;
	} else {
		return `${(n / 1e9).toFixed(1)}B`;
	}
}
