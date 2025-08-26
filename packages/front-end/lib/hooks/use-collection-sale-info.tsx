import { config } from '@/components/providers/RainbowKitAllProvider';
import { useQuery } from '@apollo/client';
import { ChainIdParameter } from '@wagmi/core/internal';
import findCollection from '../graphql/queries/find-collection';
import { QueryMode } from '@/apollo/gql/graphql';
import useNFTsSaleInfo from './use-nfts-sale-info';

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
	const {
		topOfferListing,
		floorSaleListing,
		totalVolumeInUSD,
		loading: saleInfoLoading,
	} = useNFTsSaleInfo({
		nfts:
			data?.findFirstCollection?.importedNfts.map((nft) => {
				return {
					contractAddress: nft.contractAddress as `0x${string}`,
					tokenId: nft.tokenId,
					chainId,
				};
			}) ?? [],
	});
	return {
		topOfferListing,
		floorSaleListing,
		totalVolumeInUSD,
		loading: saleInfoLoading || loading,
	};
}
