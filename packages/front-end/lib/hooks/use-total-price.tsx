import { NFTDetailProps } from '@/components/nft/detail';
import { useQuery } from '@apollo/client';
import { findNFTs } from '../graphql/queries/find-nft';
import { QueryMode } from '@/apollo/gql/graphql';
import { ChainIdParameter } from '@wagmi/core/internal';
import { config } from '@/components/providers/RainbowKitAllProvider';
import { useAccount, useBalance, useReadContracts } from 'wagmi';
import { erc20Abi } from 'smart-contract/wagmi/generated';
import { CHAIN_CURRENCY_ADDRESS } from '../currency';

export default function useTotalPrice(
	chainId: ChainIdParameter<typeof config>['chainId'],
	nfts: NFTDetailProps[],
) {
	if (nfts.some((nft) => nft.chainId !== chainId)) {
		throw new Error(
			'useTotalPrice can only be passed with nfts from the same chain',
		);
	}
	const { data, loading } = useQuery(findNFTs, {
		variables: {
			where: {
				OR: nfts.map((nft) => {
					return {
						contractAddress: {
							equals: nft.contractAddress,
							mode: QueryMode.Insensitive,
						},
						tokenId: {
							equals: nft.tokenId,
						},
						collection: {
							is: {
								chainId: {
									equals: nft.chainId,
								},
							},
						},
					};
				}),
			},
		},
		pollInterval: 2000,
		fetchPolicy: 'network-only',
	});
	const ret = new Map<string, { price: bigint; name: string }>();
	let ethPayAmount = 0n;
	data?.nFTS.forEach((nft) => {
		if (nft.activeItem) {
			if (
				chainId &&
				nft.activeItem.listing.erc20TokenAddress ===
					CHAIN_CURRENCY_ADDRESS[chainId].WETH
			) {
				ethPayAmount += nft.activeItem.listing.price;
			}
			const old = ret.get(nft.activeItem.listing.erc20TokenAddress);
			ret.set(
				nft.activeItem.listing.erc20TokenAddress,
				old === undefined
					? {
							name: nft.activeItem.listing.erc20TokenName,
							price: nft.activeItem.listing.price,
						}
					: {
							price: nft.activeItem.listing.price + old.price,
							name: old.name,
						},
			);
		}
	});
	const { address } = useAccount();
	const { data: nativeBalance } = useBalance({
		chainId,
		address,
	});
	const balances = useReadContracts({
		contracts: Array.from(ret.entries()).map(
			(
				e,
			): {
				abi: typeof erc20Abi;
				address: `0x${string}`;
				functionName: 'balanceOf';
				chainId: number | undefined;
				args: [string | undefined];
			} => {
				return {
					abi: erc20Abi,
					address: e[0] as `0x${string}`,
					functionName: 'balanceOf',
					chainId,
					args: [address],
				};
			},
		),
	});
	const balanceEnough = Array.from(ret.entries()).every((e, index) => {
		const bal =
			e[1].name === 'WETH' || e[1].name === 'Wrapped Ether'
				? nativeBalance?.value
				: balances.data?.at(index)?.result;
		console.log(`the balance of ${e[1].name} in the wallet is`, bal);
		console.log(`the price of ${e[1].name} is`, e[1].price);
		return (bal ?? 0) > e[1].price;
	});
	return { totalPrice: ret, loading, balanceEnough, ethPayAmount };
}
