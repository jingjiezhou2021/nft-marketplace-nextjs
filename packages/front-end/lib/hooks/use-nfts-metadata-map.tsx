import { NFTDetailProps } from '@/components/nft/detail';
import { useEffect, useState } from 'react';
import { getNFTMetadata, NFTMetadata } from '../nft';
import getTraitValuesMap from '../nft/traits';
import { ReadonlyURLSearchParams, useSearchParams } from 'next/navigation';
import { Range } from './use-range';
import { ALL } from '@/components/filter';
type TraitsValuesMap = Map<string, Map<string | number, number>>;
export default function useNFTsMetadataMap(nfts: NFTDetailProps[]) {
	const [traitValuesMap, setTraitValuesMap] = useState<TraitsValuesMap>();
	const [calculating, setCalculating] = useState(true);
	useEffect(() => {
		if (nfts) {
			setCalculating(true);
			Promise.all(
				nfts.map((n) => {
					return getNFTMetadata(
						n.contractAddress as `0x${string}`,
						n.tokenId,
						n.chainId,
					);
				}),
			).then((arr: NFTMetadata[]) => {
				const map = getTraitValuesMap(arr);
				setTraitValuesMap(map);
				setCalculating(false);
			});
		}
	}, [nfts]);
	return { data: traitValuesMap, loading: calculating };
}
export function useTraitsValuesFilteredNfts(
	nfts: NFTDetailProps[],
	searchParams: ReadonlyURLSearchParams,
) {
	const [calculating, setCalculating] = useState(true);
	const { data: traitsValuesMap, loading: traitsValuesMapLoading } =
		useNFTsMetadataMap(nfts);
	const [filteredNfts, setFilteredNfts] = useState<NFTDetailProps[]>([]);
	useEffect(() => {
		if (nfts && traitsValuesMap) {
			setCalculating(true);
			Promise.all(
				nfts.map(async (n) => {
					const metadata = await getNFTMetadata(
						n.contractAddress as `0x${string}`,
						n.tokenId,
						n.chainId,
					);
					let pass = true;
					Array.from(traitsValuesMap.keys()).forEach((trait) => {
						if (pass === false) {
							return;
						}
						const filterStr = searchParams.get(trait);
						if (filterStr === null || filterStr === ALL) {
							return;
						}
						const targetAttr = metadata.attributes?.find((attr) => {
							if (attr.trait_type) {
								return attr.trait_type === trait;
							} else {
								return Object.keys(attr)[0] === trait;
							}
						});
						if (targetAttr) {
							const targetAttrValue =
								targetAttr.value ??
								Object.values(targetAttr)[0];

							try {
								const range: Range = JSON.parse(filterStr);
								if (typeof range === 'object') {
									if (
										(targetAttrValue as number) <
											(range.data.min ?? -Infinity) ||
										(targetAttrValue as number) >
											(range.data.max ?? Infinity)
									) {
										pass = false;
									}
								} else {
									throw new Error();
								}
							} catch (err) {
								const filterContent = filterStr.split(',');
								if (
									!filterContent.includes(
										targetAttrValue as string,
									)
								) {
									pass = false;
								}
							}
						} else {
							pass = false;
						}
					});
					if (pass) {
						return n;
					} else {
						return null;
					}
				}),
			)
				.then((arr) => arr.filter((item) => item !== null))
				.then((arr) => {
					setFilteredNfts(arr);
					setCalculating(false);
				});
		}
	}, [nfts, traitsValuesMap, searchParams]);
	return {
		data: filteredNfts,
		loading: calculating || traitsValuesMapLoading,
	};
}
