export default async function checkOwnerShip(
	chainId: number | string,
	address: string,
	tokenId: number | string,
) {
	const url = new URL(
		`api/check-ownership/${chainId}/${address}/${tokenId}`,
		process.env.NEXT_PUBLIC_SERVER_ENDPOINT,
	).toString();
	console.log(url);
	const res = await fetch(url);
	const data: { refresh: boolean } = await res.json();
	return data;
}
