import { NFTDetailProps } from '@/components/nft/detail';
import useCurrencyRate from './use-currency-rate';
import { getUSDPrice, SEPOLIA_AAVE_WETH } from '../currency';
import { sepolia } from 'viem/chains';
import { useEffect, useMemo, useState } from 'react';
import { formatUnits } from 'viem';
import { useQuery } from '@apollo/client';
import { findNFTs } from '../graphql/queries/find-nft';
import { QueryMode } from '@/apollo/gql/graphql';
import { useSearchParams } from 'next/navigation';
import { getRangeInUsd, Range } from './use-range';

export default function usePriceFilteredNfts(nfts: NFTDetailProps[]) {
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
	const {
		data: ethRateData,
		decimals: ethRateDecimals,
		loading: currencyRateLoading,
	} = useCurrencyRate({
		erc20TokenAddress: SEPOLIA_AAVE_WETH,
		chainId: sepolia.id,
	});
	const ethRate = useMemo(() => {
		return parseFloat(formatUnits(ethRateData, ethRateDecimals));
	}, [ethRateData, ethRateDecimals]);
	const searchParams = useSearchParams();
	const [ret, setRet] = useState<NFTDetailProps[]>([]);
	const [calculating, setCalculating] = useState(true);
	useEffect(() => {
		setCalculating(true);
		Promise.all(
			nftsData?.nFTS?.map(async (nft) => {
				if (nft.activeItem) {
					const usdPrice = await getUSDPrice({
						...nft.activeItem.listing,
						chainId: nft.collection.chainId,
					});
					return {
						usdPrice,
						nft,
					};
				} else {
					return { nft };
				}
			}) ?? [],
		)
			.then((arr) => {
				const priceFilter = searchParams.get('price')
					? (JSON.parse(searchParams.get('price')!) as Range<{
							currency: string;
						}>)
					: null;
				return arr
					.filter((item) => {
						if (
							priceFilter &&
							(priceFilter.data.max || priceFilter.data.min)
						) {
							if (item.usdPrice) {
								const { min, max } = getRangeInUsd(
									priceFilter,
									ethRate,
								);
								return (
									item.usdPrice < max && item.usdPrice > min
								);
							} else {
								return false;
							}
						} else {
							return true;
						}
					})
					.map((item) => {
						return {
							contractAddress: item.nft
								.contractAddress as `0x${string}`,
							tokenId: item.nft.tokenId,
							chainId: item.nft.collection.chainId,
						};
					});
			})
			.then((ret) => {
				setCalculating(false);
				setRet(ret);
			});
	}, [nftsData, searchParams, ethRate]);
	return {
		data: ret,
		loading: calculating || nftsDataLoading || currencyRateLoading,
	};
}
