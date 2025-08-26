import { NFTDetailProps } from '@/components/nft/detail';
import { useQuery } from '@apollo/client';
import { findNFTs } from '../graphql/queries/find-nft';
import { Listing, QueryMode } from '@/apollo/gql/graphql';
import { useEffect, useState } from 'react';
import { ValuesType } from 'utility-types';
import {
	getCurrencyRate,
	getTotalValueInUSD,
	getUSDPrice,
	maxListingInUSD,
	minListingInUSD,
} from '../currency';
import { ChainIdParameter } from '@wagmi/core/internal';
import { config } from '@/components/providers/RainbowKitAllProvider';
import useNFTOffers from './use-nft-offers';
export function useNFTsTopOffer({ nfts }: { nfts: NFTDetailProps[] }) {
	const { filteredOffers, loading: filteredOffersLoading } =
		useNFTOffers(nfts);
	const [calculating, setCalculating] = useState(true);
	const [topOfferListing, setTopOfferListing] = useState<
		| (Pick<Listing, 'erc20TokenAddress' | 'price' | 'erc20TokenName'> & {
				chainId: ChainIdParameter<typeof config>['chainId'];
		  })
		| null
	>();
	useEffect(() => {
		if (!filteredOffersLoading && filteredOffers) {
			setCalculating(true);
			maxListingInUSD(
				filteredOffers.map((offer) => {
					return {
						erc20TokenAddress: offer.listing.erc20TokenAddress,
						erc20TokenName: offer.listing.erc20TokenName,
						price: offer.listing.price,
						chainId: offer.chainId,
					};
				}),
			).then((maxListing) => {
				setCalculating(false);
				setTopOfferListing(maxListing);
			});
		}
	}, [filteredOffers, filteredOffersLoading]);
	return {
		data: topOfferListing,
		loading: calculating || filteredOffersLoading,
	};
}
export function useNFTsLastSale({ nfts }: { nfts: NFTDetailProps[] }) {
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
	const [lastSaleListing, setLastSaleListing] = useState<
		| (Pick<Listing, 'erc20TokenAddress' | 'price' | 'erc20TokenName'> & {
				chainId: ChainIdParameter<typeof config>['chainId'];
		  })
		| null
	>();
	useEffect(() => {
		if (!loading && data) {
			const itemBoughtsArr = data.nFTS.map((nft) => nft.itemBought);
			const itemBoughts: ValuesType<typeof itemBoughtsArr> =
				itemBoughtsArr.reduce((prev, cur) => {
					return prev.concat(cur);
				}, []);
			if (itemBoughts.length === 0) {
				setLastSaleListing(null);
			} else {
				let latestIdx = 0;
				itemBoughts.forEach((ib, index) => {
					if (
						new Date(ib.createdAt).getTime() >
						new Date(itemBoughts[latestIdx].createdAt).getTime()
					) {
						latestIdx = index;
					}
				});
				const latestBought = itemBoughts[latestIdx];
				setLastSaleListing({
					erc20TokenAddress: latestBought.listing.erc20TokenAddress,
					erc20TokenName: latestBought.listing.erc20TokenName,
					price: latestBought.listing.price,
					chainId: latestBought.chainId,
				});
			}
		}
	}, [data, loading]);
	return {
		data: lastSaleListing,
		loading,
	};
}
export function useNFTsFloorSale({ nfts }: { nfts: NFTDetailProps[] }) {
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
	const [floorSaleListing, setFloorSaleListing] = useState<
		| (Pick<Listing, 'erc20TokenAddress' | 'price' | 'erc20TokenName'> & {
				chainId: ChainIdParameter<typeof config>['chainId'];
		  })
		| null
	>();
	const [calculating, setCalculating] = useState(true);
	useEffect(() => {
		if (!loading && data) {
			setCalculating(true);
			const itemListedArr = data.nFTS.map((nft) => nft.itemListed);
			const itemListeds: ValuesType<typeof itemListedArr> = itemListedArr
				.reduce((prev, cur) => {
					return prev.concat(cur);
				}, [])
				.filter((il) => il.nft?.activeItem?.id);
			const itemBoughtsArr = data.nFTS.map((nft) => nft.itemBought);
			const itemBoughts: ValuesType<typeof itemBoughtsArr> =
				itemBoughtsArr.reduce((prev, cur) => {
					return prev.concat(cur);
				}, []);
			minListingInUSD(
				itemBoughts
					.map((ib) => {
						return {
							erc20TokenAddress: ib.listing.erc20TokenAddress,
							erc20TokenName: ib.listing.erc20TokenName,
							price: ib.listing.price,
							chainId: ib.chainId,
						};
					})
					.concat(
						itemListeds.map((il) => {
							return {
								erc20TokenAddress: il.listing.erc20TokenAddress,
								erc20TokenName: il.listing.erc20TokenName,
								price: il.listing.price,
								chainId: il.chainId,
							};
						}),
					),
			).then((minListing) => {
				setCalculating(false);
				setFloorSaleListing(minListing);
			});
		}
	}, [data, loading]);
	return {
		data: floorSaleListing,
		loading: loading || calculating,
	};
}
export function useNFTsTotalVolumeInUSD({ nfts }: { nfts: NFTDetailProps[] }) {
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
	const [totalVolumeInUSD, setTotalVolumeInUSD] = useState(0);
	const [calculating, setCalculating] = useState(true);
	useEffect(() => {
		if (!loading && data) {
			setCalculating(true);
			const itemListedArr = data.nFTS.map((nft) => nft.itemListed);
			const itemListeds: ValuesType<typeof itemListedArr> = itemListedArr
				.reduce((prev, cur) => {
					return prev.concat(cur);
				}, [])
				.filter((il) => il.nft?.activeItem?.id);
			const itemBoughtsArr = data.nFTS.map((nft) => nft.itemBought);
			const itemBoughts: ValuesType<typeof itemBoughtsArr> =
				itemBoughtsArr.reduce((prev, cur) => {
					return prev.concat(cur);
				}, []);
			getTotalValueInUSD(
				itemBoughts
					.map((ib) => {
						return {
							erc20TokenAddress: ib.listing.erc20TokenAddress,
							erc20TokenName: ib.listing.erc20TokenName,
							price: ib.listing.price,
							chainId: ib.chainId,
						};
					})
					.concat(
						itemListeds.map((il) => {
							return {
								erc20TokenAddress: il.listing.erc20TokenAddress,
								erc20TokenName: il.listing.erc20TokenName,
								price: il.listing.price,
								chainId: il.chainId,
							};
						}),
					),
			).then((val) => {
				setCalculating(false);
				setTotalVolumeInUSD(val);
			});
		}
	}, [data, loading]);
	return {
		data: totalVolumeInUSD,
		loading: loading || calculating,
	};
}
export function useNFTsTotalValueInUSD({ nfts }: { nfts: NFTDetailProps[] }) {
	const { data: nftsData, loading: nftsLoading } = useQuery(findNFTs, {
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
	const [calculating, setCalculating] = useState(true);
	const { filteredOffers, loading: filteredOffersLoading } =
		useNFTOffers(nfts);
	const [totalValueInUSD, setTotalValueInUSD] = useState(0);
	useEffect(() => {
		if (!nftsLoading && nftsData) {
			setCalculating(true);
			Promise.all(
				nftsData.nFTS.map((nft) => {
					const activeItemListing = nft.activeItem?.listing;
					const lastBoughtListing = nft.itemBought.reduce(
						(
							prev: ValuesType<typeof nft.itemBought> | null,
							cur,
						) => {
							if (prev === null) {
								return cur;
							} else {
								if (
									new Date(cur.createdAt).getTime() >
									new Date(prev.createdAt).getTime()
								) {
									return cur;
								} else {
									return prev;
								}
							}
						},
						null,
					)?.listing;
					const listingsArr = filteredOffers
						.filter((offer) =>
							nft.offers.some(
								(no) =>
									no.offerId === offer.offerId &&
									nft.collection.chainId === offer.chainId,
							),
						)
						.map((offer) => {
							return {
								erc20TokenAddress:
									offer.listing.erc20TokenAddress,
								erc20TokenName: offer.listing.erc20TokenName,
								price: offer.listing.price,
								chainId: nft.collection.chainId,
							};
						});
					if (activeItemListing) {
						listingsArr.push({
							...activeItemListing,
							chainId: nft.collection.chainId,
						});
					}
					if (lastBoughtListing) {
						listingsArr.push({
							...lastBoughtListing,
							chainId: nft.collection.chainId,
						});
					}
					return maxListingInUSD(listingsArr);
				}),
			)
				.then((nftMaxListings) => {
					const filtered = nftMaxListings.filter((l) => l !== null);
					debugger;
					return getTotalValueInUSD(filtered);
				})
				.then((ans) => {
					setCalculating(false);
					setTotalValueInUSD(ans);
				});
		}
	}, [nftsData, nftsLoading, filteredOffers, filteredOffersLoading]);
	return {
		data: totalValueInUSD,
		loading: nftsLoading || calculating || filteredOffersLoading,
	};
}
export default function useNFTsSaleInfo({ nfts }: { nfts: NFTDetailProps[] }) {
	const { data: topOfferListing, loading: topOfferListingLoading } =
		useNFTsTopOffer({ nfts });
	const { data: floorSaleListing, loading: floorSaleListingLoading } =
		useNFTsFloorSale({ nfts });
	const { data: lastSaleListing, loading: lastSaleListingLoading } =
		useNFTsLastSale({ nfts });
	const { data: totalVolumeInUSD, loading: totalVolumeInUSDLoading } =
		useNFTsTotalVolumeInUSD({ nfts });
	const { data: totalValueInUSD, loading: totalValueInUSDLoading } =
		useNFTsTotalValueInUSD({ nfts });
	return {
		topOfferListing,
		floorSaleListing,
		lastSaleListing,
		totalVolumeInUSD,
		totalValueInUSD,
		loading:
			topOfferListingLoading ||
			floorSaleListingLoading ||
			lastSaleListingLoading ||
			totalVolumeInUSDLoading ||
			totalValueInUSDLoading,
	};
}
