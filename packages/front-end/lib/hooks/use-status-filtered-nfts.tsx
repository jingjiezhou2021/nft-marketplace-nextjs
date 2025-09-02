import { NFTDetailProps } from '@/components/nft/detail';
import { useQuery } from '@apollo/client';
import { findNFTs } from '../graphql/queries/find-nft';
import { QueryMode } from '@/apollo/gql/graphql';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

export default function useStatusFilteredNfts(nfts: NFTDetailProps[]) {
	const { data: nftsData, loading: nftsDataLoading } = useQuery(findNFTs, {
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
	const searchParams = useSearchParams();
	const data: NFTDetailProps[] = useMemo(() => {
		const status = searchParams.get('nft-status');
		const filteredNfts =
			nftsData?.nFTS
				.filter((nft) => {
					if (status === 'all' || status === null) {
						return true;
					} else {
						if (status === 'Listed') {
							return nft.activeItem;
						} else {
							return !nft.activeItem;
						}
					}
				})
				.map((nftData) => {
					return {
						contractAddress:
							nftData.contractAddress as `0x${string}`,
						tokenId: nftData.tokenId,
						chainId: nftData.collection.chainId,
					};
				}) ?? [];
		return filteredNfts;
	}, [searchParams, nftsData]);
	return {
		data,
		loading: nftsDataLoading,
	};
}
