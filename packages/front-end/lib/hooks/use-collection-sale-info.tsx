import { config } from '@/components/providers/RainbowKitAllProvider';
import { useQuery } from '@apollo/client';
import { ChainIdParameter } from '@wagmi/core/internal';
import findCollection, {
	findCollections,
} from '../graphql/queries/find-collection';
import { QueryMode } from '@/apollo/gql/graphql';
import useNFTsSaleInfo, { getNFTsSaleInfo } from './use-nfts-sale-info';
import { useEffect, useMemo, useState } from 'react';

export function useCollectionsSaleInfo(
	collectionArr: {
		address: `0x${string}`;
		chainId: ChainIdParameter<typeof config>['chainId'];
	}[],
) {
	const { data, loading: collectionsLoading } = useQuery(findCollections, {
		variables: {
			where: {
				OR: collectionArr.map((c) => {
					return {
						address: {
							equals: c.address,
							mode: QueryMode.Insensitive,
						},
						chainId: {
							equals: c.chainId,
						},
					};
				}),
			},
		},
	});
	const [collectionsInfo, setCollectionsInfo] = useState<
		Awaited<ReturnType<typeof getNFTsSaleInfo>>[]
	>([]);
	const [calculating, setCalculating] = useState(true);
	useEffect(() => {
		setCalculating(true);
		const promiseArr =
			data?.collections.map((c) => {
				return getNFTsSaleInfo({
					nfts: c.importedNfts.map((nft) => {
						return {
							contractAddress:
								nft.contractAddress as `0x${string}`,
							tokenId: nft.tokenId,
							chainId: nft.collection.chainId,
						};
					}),
				});
			}) ?? [];
		Promise.all(promiseArr).then((collectionsInfo) => {
			setCalculating(false);
			setCollectionsInfo(collectionsInfo);
		});
	}, [data]);
	return {
		data: collectionsInfo,
		loading: collectionsLoading || calculating,
	};
}

export default function useCollectionSaleInfo(
	address: `0x${string}`,
	chainId: ChainIdParameter<typeof config>['chainId'],
) {
	const { data, loading } = useQuery(findCollection, {
		variables: {
			where: {
				address: {
					equals: address,
					mode: QueryMode.Insensitive,
				},
				chainId: {
					equals: chainId,
				},
			},
		},
	});
	const nftsMemo = useMemo(() => {
		return (
			data?.findFirstCollection?.importedNfts.map((nft) => {
				return {
					contractAddress: nft.contractAddress as `0x${string}`,
					tokenId: nft.tokenId,
					chainId,
				};
			}) ?? []
		);
	}, [data]);
	const {
		topOfferListing,
		floorSaleListing,
		totalVolumeInUSD,
		loading: saleInfoLoading,
	} = useNFTsSaleInfo({
		nfts: nftsMemo,
	});
	return {
		topOfferListing,
		floorSaleListing,
		totalVolumeInUSD,
		loading: saleInfoLoading || loading,
	};
}
