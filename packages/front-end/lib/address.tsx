export function getAddressAbbreviation(address: string, chars = 4): string {
	if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
		throw new Error('Invalid EVM address');
	}
	return `${address.slice(0, 2 + chars)}...${address.slice(-chars)}`;
}
