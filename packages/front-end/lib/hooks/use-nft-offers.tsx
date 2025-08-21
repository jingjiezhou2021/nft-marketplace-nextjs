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
type OfferDetail = ValuesType<ValuesType<NftsQuery['nFTS']>['offers']>;
export default function useNFTOffers(nfts: NFTDetailProps[]) {
	const { address } = useAccount();
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
		fetchPolicy: 'network-only',
		nextFetchPolicy: 'cache-first',
	});
	const unfilteredOffers = useMemo<OfferDetail[]>(() => {
		const ret: OfferDetail[] = [];
		data?.nFTS.forEach((nft) => {
			nft.offers.forEach((offer) => {
				ret.push(offer);
			});
		});
		return ret;
	}, [data]);
	const config = useConfig();
	const [filteredOffers, setFilteredOffers] = useState<OfferDetail[]>([]);
	const [filtering, setFiltering] = useState(true);
	useEffect(() => {
		setFiltering(true);
		const uncanceledOffers: OfferDetail[] = unfilteredOffers.filter(
			(offer) => offer.itemOfferMade && !offer.itemOfferCanceled,
		);
		Promise.all(
			uncanceledOffers.map((offer) => {
				return readContract(config, {
					abi: erc20Abi,
					functionName: 'balanceOf',
					address: offer.listing.erc20TokenAddress as `0x${string}`,
					chainId: offer.chainId,
					args: [offer.buyer as `0x${string}`],
				})
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
							return readContract(config, {
								abi: erc20Abi,
								functionName: 'allowance',
								address: offer.listing
									.erc20TokenAddress as `0x${string}`,
								chainId: offer.chainId,
								args: [
									offer.buyer as `0x${string}`,
									MARKETPLACE_ADDRESS[offer.chainId],
								],
							})
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
				setFilteredOffers(
					uncanceledAndBalanceEnoughAndAllowanceEnoughOffers.filter(
						(offer) => offer !== null,
					),
				);
				setFiltering(false);
			});
	}, [unfilteredOffers, config]);
	const unableToPayButYourOffers = useMemo<OfferDetail[]>(() => {
		const ret: OfferDetail[] = [];
		unfilteredOffers.forEach((offer) => {
			if (
				filteredOffers.find((fo) => fo.offerId === offer.offerId) ===
					undefined &&
				!offer.itemOfferCanceled &&
				offer.buyer.toLowerCase() === address?.toLowerCase()
			) {
				ret.push(offer);
			}
		});
		return ret;
	}, [unfilteredOffers, filteredOffers, address]);
	return {
		filteredOffers,
		unfilteredOffers,
		unableToPayButYourOffers,
		loading: loading || filtering,
	};
}
