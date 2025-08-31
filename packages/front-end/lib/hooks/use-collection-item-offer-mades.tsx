import { useQuery } from '@apollo/client';
import findItemOfferMades from '../graphql/queries/find-item-offers';
import { QueryMode } from '@/apollo/gql/graphql';
import useItemOfferMades from './use-item-offers';
import { ChainIdParameter } from '@wagmi/core/internal';
import { config } from '@/components/providers/RainbowKitAllProvider';

export function useCollectionItemOfferMades(
	address: `0x${string}`,
	chainId: ChainIdParameter<typeof config>['chainId'],
) {
	const { data: itemOfferMades, loading: itemOfferMadesLoading } = useQuery(
		findItemOfferMades,
		{
			variables: {
				where: {
					offer: {
						is: {
							nftAddress: {
								equals: address,
								mode: QueryMode.Insensitive,
							},
							chainId: {
								equals: chainId,
							},
						},
					},
				},
			},
		},
	);
	const { data, refetch, loading } = useItemOfferMades(
		itemOfferMades?.nftMarketplace__ItemOfferMades.map(
			(event) => event.id,
		) ?? [],
	);
	return {
		data,
		refetch,
		loading: loading || itemOfferMadesLoading,
	};
}
