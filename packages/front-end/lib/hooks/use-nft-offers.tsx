import { NFTDetailProps } from '@/components/nft/detail';
import { useQuery } from '@apollo/client';
import { findNFTs } from '../graphql/queries/find-nft';
import { NftsQuery, QueryMode } from '@/apollo/gql/graphql';
import { ValuesType } from 'utility-types';
import { useEffect, useMemo, useState } from 'react';
import { erc20Abi } from 'smart-contract/wagmi/generated';
import { useAccount, useConfig } from 'wagmi';
import { readContract } from '@wagmi/core';
import MARKETPLACE_ADDRESS from '../market';
import createApolloClient from '@/apollo';
import { config } from '@/components/providers/RainbowKitAllProvider';
import { withCache } from '../indexedDB';
type OfferDetail = ValuesType<ValuesType<NftsQuery['nFTS']>['offers']>;
export async function getNFTOffers(nfts: NFTDetailProps[]) {
	const client = createApolloClient();
	const { data, error } = await client.query({
		query: findNFTs,
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
	if (error) {
		console.error(error);
		throw new Error(error.cause?.message);
	}
	const unfilteredOffers: OfferDetail[] = [];
	data.nFTS.forEach((nft) => {
		nft.offers.forEach((offer) => {
			unfilteredOffers.push(offer);
		});
	});
	const uncanceledOffers: OfferDetail[] = unfilteredOffers.filter(
		(offer) =>
			offer.itemOfferMade &&
			!offer.itemOfferCanceled &&
			!offer.itemOfferAccepted,
	);
	const filteredOffers = await Promise.all(
		uncanceledOffers.map((offer) => {
			return withCache(
				'balanceOf',
				`${offer.chainId}-${offer.listing.erc20TokenAddress}-${offer.buyer}`,
				30 * 1000,
				() => {
					return readContract(config, {
						abi: erc20Abi,
						functionName: 'balanceOf',
						address: offer.listing
							.erc20TokenAddress as `0x${string}`,
						chainId: offer.chainId,
						args: [offer.buyer as `0x${string}`],
					});
				},
			)
				.then((buyerBalance) => {
					return buyerBalance >= offer.listing.price;
				})
				.then((buyerBalanceEnough) => {
					return buyerBalanceEnough ? offer : null;
				});
		}),
	)
		.then((uncanceledAndBalanceEnoughOffers) => {
			return Promise.all(
				uncanceledAndBalanceEnoughOffers
					.filter((offer) => offer !== null)
					.map((offer) => {
						return withCache(
							'allowance',
							`${offer.chainId}-${offer.listing.erc20TokenAddress}-${offer.buyer}-${MARKETPLACE_ADDRESS[offer.chainId]}`,
							60 * 1000,
							() =>
								readContract(config, {
									abi: erc20Abi,
									functionName: 'allowance',
									address: offer.listing
										.erc20TokenAddress as `0x${string}`,
									chainId: offer.chainId,
									args: [
										offer.buyer as `0x${string}`,
										MARKETPLACE_ADDRESS[offer.chainId],
									],
								}),
						)
							.then((allowance) => {
								return allowance >= offer.listing.price;
							})
							.then((allowanceEnough) => {
								return allowanceEnough ? offer : null;
							});
					}),
			);
		})
		.then((uncanceledAndBalanceEnoughAndAllowanceEnoughOffers) => {
			return uncanceledAndBalanceEnoughAndAllowanceEnoughOffers.filter(
				(offer) => offer !== null,
			);
		});
	return {
		filteredOffers,
		unfilteredOffers,
	};
}

export default function useNFTOffers(nfts: NFTDetailProps[]) {
	const { address } = useAccount();
	const [unfilteredOffers, setUnfilteredOffers] = useState<OfferDetail[]>([]);
	const [filteredOffers, setFilteredOffers] = useState<OfferDetail[]>([]);
	const [filtering, setFiltering] = useState(true);
	const [refetchFlag, setRefetchFlag] = useState(false);
	useEffect(() => {
		setFiltering(true);
		getNFTOffers(nfts).then(({ filteredOffers, unfilteredOffers }) => {
			setFilteredOffers(filteredOffers);
			setUnfilteredOffers(unfilteredOffers);
			setFiltering(false);
		});
	}, [nfts, refetchFlag]);
	const unableToPayButYourOffers = useMemo<OfferDetail[]>(() => {
		const ret: OfferDetail[] = [];
		unfilteredOffers.forEach((offer) => {
			if (
				filteredOffers.find((fo) => fo.offerId === offer.offerId) ===
					undefined &&
				!offer.itemOfferCanceled &&
				!offer.itemOfferAccepted &&
				offer.buyer.toLowerCase() === address?.toLowerCase()
			) {
				ret.push(offer);
			}
		});
		return ret;
	}, [unfilteredOffers, filteredOffers, address]);
	const refetch = () => {
		console.log('refetching orders');
		setRefetchFlag((flag) => !flag);
	};
	return {
		filteredOffers,
		unfilteredOffers,
		unableToPayButYourOffers,
		loading: filtering,
		refetch,
	};
}
