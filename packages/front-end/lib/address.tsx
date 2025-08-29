export function getAddressAbbreviation(
	address: string | undefined | null,
	chars = 4,
): string {
	if (!address) {
		return '';
	}
	if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
		console.warn('Invalid EVM address');
	}
	return `${address.slice(0, 2 + chars)}...${address.slice(-chars)}`;
}
