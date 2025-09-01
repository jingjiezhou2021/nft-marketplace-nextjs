import { NFTDetailProps } from '@/components/nft/detail';
import { useQuery } from '@apollo/client';
import { findNFTs } from '../graphql/queries/find-nft';
import { QueryMode } from '@/apollo/gql/graphql';
import { useEffect, useMemo, useState } from 'react';
import { getNFTsSaleInfo } from './use-nfts-sale-info';

export default function useOwnerNftsCount(nfts: NFTDetailProps[]) {
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
	});
	const [calculating, setCalculating] = useState(true);
	const map = useMemo(() => {
		if (data?.nFTS) {
			const ownerNftsMap = new Map<string, NFTDetailProps[]>();
			data.nFTS.forEach((nft) => {
				const nftsOfOwner = ownerNftsMap.get(nft.user.address);
				const item = {
					contractAddress: nft.contractAddress as `0x${string}`,
					tokenId: nft.tokenId,
					chainId: nft.collection.chainId,
				};
				if (nftsOfOwner !== undefined) {
					nftsOfOwner.push(item);
				} else {
					ownerNftsMap.set(nft.user.address, [item]);
				}
			});
			return ownerNftsMap;
		} else {
			return null;
		}
	}, [data]);
	const [ret, setRet] = useState<{
		data: {
			owner: string;
			nfts: NFTDetailProps[];
			saleInfo: Awaited<ReturnType<typeof getNFTsSaleInfo>>;
		}[];
		maxCount: number;
	}>();
	useEffect(() => {
		setCalculating(true);
		Promise.all(
			Array.from(map?.entries() ?? []).map(async (e) => {
				const saleInfo = await getNFTsSaleInfo({ nfts: e[1] });
				return {
					owner: e[0],
					saleInfo,
					nfts: e[1],
				};
			}),
		).then((data) => {
			const maxCount = data.reduce((prev, cur) => {
				if (cur.nfts.length > prev) {
					return cur.nfts.length;
				} else {
					return prev;
				}
			}, 0);
			setRet({
				data,
				maxCount,
			});
			setCalculating(false);
		});
	}, [map]);

	return {
		data: ret,
		loading: loading || calculating,
	};
}
