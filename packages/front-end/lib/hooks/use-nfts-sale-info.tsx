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
import useNFTOffers, { getNFTOffers } from './use-nft-offers';
import createApolloClient from '@/apollo';
export async function getNFTsTopOffer({ nfts }: { nfts: NFTDetailProps[] }) {
	const { filteredOffers } = await getNFTOffers(nfts);
	const maxListing = await maxListingInUSD(
		filteredOffers.map((offer) => {
			return {
				erc20TokenAddress: offer.listing.erc20TokenAddress,
				erc20TokenName: offer.listing.erc20TokenName,
				price: offer.listing.price,
				chainId: offer.chainId,
			};
		}),
	);
	return maxListing;
}
export function useNFTsTopOffer({ nfts }: { nfts: NFTDetailProps[] }) {
	const [calculating, setCalculating] = useState(true);
	const [topOfferListing, setTopOfferListing] = useState<
		| (Pick<Listing, 'erc20TokenAddress' | 'price' | 'erc20TokenName'> & {
				chainId: ChainIdParameter<typeof config>['chainId'];
		  })
		| null
	>();
	useEffect(() => {
		setCalculating(true);
		getNFTsTopOffer({ nfts }).then((maxListing) => {
			setCalculating(false);
			setTopOfferListing(maxListing);
		});
	}, [nfts]);
	return {
		data: topOfferListing,
		loading: calculating,
	};
}

export async function getNFTsLastSale({ nfts }: { nfts: NFTDetailProps[] }) {
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
	const itemBoughtsArr = data.nFTS.map((nft) => nft.itemBought);
	const itemBoughts: ValuesType<typeof itemBoughtsArr> =
		itemBoughtsArr.reduce((prev, cur) => {
			return prev.concat(cur);
		}, []);
	if (itemBoughts.length === 0) {
		return null;
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
		return {
			erc20TokenAddress: latestBought.listing.erc20TokenAddress,
			erc20TokenName: latestBought.listing.erc20TokenName,
			price: latestBought.listing.price,
			chainId: latestBought.chainId,
		};
	}
}

export function useNFTsLastSale({ nfts }: { nfts: NFTDetailProps[] }) {
	const [lastSaleListing, setLastSaleListing] = useState<
		| (Pick<Listing, 'erc20TokenAddress' | 'price' | 'erc20TokenName'> & {
				chainId: ChainIdParameter<typeof config>['chainId'];
		  })
		| null
	>();
	const [calculating, setCalculating] = useState(true);
	useEffect(() => {
		getNFTsLastSale({ nfts }).then((lastSale) => {
			setLastSaleListing(lastSale);
			setCalculating(false);
		});
	}, [nfts]);
	return {
		data: lastSaleListing,
		loading: calculating,
	};
}

export async function getNFTsFloorSale({ nfts }: { nfts: NFTDetailProps[] }) {
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
	const minListing = await minListingInUSD(
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
	);
	return minListing;
}

export function useNFTsFloorSale({ nfts }: { nfts: NFTDetailProps[] }) {
	const [floorSaleListing, setFloorSaleListing] = useState<
		| (Pick<Listing, 'erc20TokenAddress' | 'price' | 'erc20TokenName'> & {
				chainId: ChainIdParameter<typeof config>['chainId'];
		  })
		| null
	>();
	const [calculating, setCalculating] = useState(true);
	useEffect(() => {
		getNFTsFloorSale({ nfts }).then((minListing) => {
			setFloorSaleListing(minListing);
			setCalculating(false);
		});
	}, [nfts]);
	return {
		data: floorSaleListing,
		loading: calculating,
	};
}

export async function getNFTsTotalVolumeInUSD({
	nfts,
}: {
	nfts: NFTDetailProps[];
}) {
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
	const val = await getTotalValueInUSD(
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
	);
	return val;
}

export function useNFTsTotalVolumeInUSD({ nfts }: { nfts: NFTDetailProps[] }) {
	const [totalVolumeInUSD, setTotalVolumeInUSD] = useState(0);
	const [calculating, setCalculating] = useState(true);
	useEffect(() => {
		setCalculating(true);
		getNFTsTotalVolumeInUSD({ nfts }).then((val) => {
			setCalculating(false);
			setTotalVolumeInUSD(val);
		});
	}, [nfts]);
	return {
		data: totalVolumeInUSD,
		loading: calculating,
	};
}
export async function getNFTsTotalValueInUSD({
	nfts,
}: {
	nfts: NFTDetailProps[];
}) {
	const client = createApolloClient();
	const { data: nftsData, error } = await client.query({
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
	const { filteredOffers } = await getNFTOffers(nfts);
	return await Promise.all(
		nftsData.nFTS.map((nft) => {
			const activeItemListing = nft.activeItem?.listing;
			const lastBoughtListing = nft.itemBought.reduce(
				(prev: ValuesType<typeof nft.itemBought> | null, cur) => {
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
						erc20TokenAddress: offer.listing.erc20TokenAddress,
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
			return getTotalValueInUSD(filtered);
		})
		.then((ans) => {
			return ans;
		});
}

export function useNFTsTotalValueInUSD({ nfts }: { nfts: NFTDetailProps[] }) {
	const [calculating, setCalculating] = useState(true);
	const [totalValueInUSD, setTotalValueInUSD] = useState(0);
	useEffect(() => {
		setCalculating(true);
		getNFTsTotalValueInUSD({ nfts }).then((ans) => {
			setCalculating(false);
			setTotalValueInUSD(ans);
		});
	}, [nfts]);
	return {
		data: totalValueInUSD,
		loading: calculating,
	};
}

export async function getNFTsSaleInfo({ nfts }: { nfts: NFTDetailProps[] }) {
	const topOfferListing = await getNFTsTopOffer({ nfts });
	const floorSaleListing = await getNFTsFloorSale({ nfts });
	const lastSaleListing = await getNFTsLastSale({ nfts });
	const totalVolumeInUSD = await getNFTsTotalVolumeInUSD({ nfts });
	const totalValueInUSD = await getNFTsTotalValueInUSD({ nfts });
	return {
		topOfferListing,
		floorSaleListing,
		lastSaleListing,
		totalVolumeInUSD,
		totalValueInUSD,
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
