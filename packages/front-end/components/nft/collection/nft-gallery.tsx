import { FindFirstUserProfileQuery, QueryMode } from '@/apollo/gql/graphql';
import { CollapsibleFilter, Filter, FilterContent } from '@/components/filter';
import { SimpleRange } from '@/components/filter/range';
import { PRICE, PriceRange } from '@/components/filter/range/price-range';
import ChoiceSelection from '@/components/filter/selection';
import NFTStatusSelection from '@/components/filter/selection/nft-status-selection';
import { FilterTags } from '@/components/filter/tag';
import { NFTGalleryContent } from '@/components/nft-gallery';
import { getNFTMetadata, NFTMetadata } from '@/lib/nft';
import getTraitValuesMap from '@/lib/nft/traits';
import { cn } from '@/lib/utils';
import { useTranslation } from 'next-i18next';
import { useEffect, useMemo, useState } from 'react';
import { NFTDetailProps } from '../detail';
import { ChainIdParameter } from '@wagmi/core/internal';
import { config } from '@/components/providers/RainbowKitAllProvider';
import { useQuery } from '@apollo/client';
import findCollection from '@/lib/graphql/queries/find-collection';
import { useSearchParams } from 'next/navigation';
import { getUSDPrice, SEPOLIA_AAVE_WETH } from '@/lib/currency';
import { getRangeInUsd, Range } from '@/lib/hooks/use-range';
import useCurrencyRate from '@/lib/hooks/use-currency-rate';
import { sepolia } from 'viem/chains';
import { formatUnits } from 'viem';
import useNFTsMetadataMap, {
	useTraitsValuesFilteredNfts,
} from '@/lib/hooks/use-nfts-metadata-map';
import useStatusFilteredNfts from '@/lib/hooks/use-status-filtered-nfts';
import usePriceFilteredNfts from '@/lib/hooks/use-price-filtered-nfts';
export default function CollectionNFTGallery({
	className,
	chainId,
	address,
}: {
	className?: string;
	chainId: ChainIdParameter<typeof config>['chainId'];
	address: `0x${string}`;
}) {
	const { t } = useTranslation('common');
	const searchParams = useSearchParams();
	const { data: collection, loading: collectionLoading } = useQuery(
		findCollection,
		{
			variables: {
				where: {
					chainId: {
						equals: chainId,
					},
					address: {
						equals: address,
						mode: QueryMode.Insensitive,
					},
				},
			},
			fetchPolicy: 'network-only',
			nextFetchPolicy: 'cache-first',
		},
	);
	const allNftDetailProps = useMemo(() => {
		return (
			collection?.findFirstCollection?.importedNfts.map((nft) => {
				return {
					contractAddress: nft.contractAddress as `0x${string}`,
					tokenId: nft.tokenId,
					chainId: nft.collection.chainId,
				};
			}) ?? []
		);
	}, [collection]);
	const { data: statusFilteredNfts, loading: statusFilteredNftsLoading } =
		useStatusFilteredNfts(allNftDetailProps);
	const { data: priceFilteredNfts, loading: priceFilteredNftsLoading } =
		usePriceFilteredNfts(statusFilteredNfts);
	const {
		data: traitsValuesFilteredNfts,
		loading: traitsValuesFilteredNftsLoading,
	} = useTraitsValuesFilteredNfts(priceFilteredNfts, searchParams);
	const { data: traitValuesMap, loading: traitsValuesMapLoading } =
		useNFTsMetadataMap(allNftDetailProps);
	const traitsFilterContent = (
		<>
			{Array.from(traitValuesMap?.entries() ?? []).map((tvs) => {
				if (
					Array.from(tvs[1].keys()).every((vk) => {
						return typeof vk === 'number';
					})
				) {
					return (
						<SimpleRange
							key={tvs[0]}
							title={tvs[0]}
							name={tvs[0]}
						/>
					);
				} else {
					return (
						<>
							<h4>{tvs[0]}</h4>
							<ChoiceSelection
								name={tvs[0]}
								includeAll
								multiple
								key={tvs[0]}
								data={Array.from(tvs[1].entries()).map(
									(vcs) => {
										return {
											value: vcs[0],
											label: vcs[0],
										};
									},
								)}
							></ChoiceSelection>
						</>
					);
				}
			})}
		</>
	);
	return (
		<div className={cn('w-full', className)}>
			<div className="w-full mb-4">
				<Filter>
					<FilterContent>
						<h4>{t('Status')}</h4>
						<NFTStatusSelection />
						<hr />
						<PriceRange
							name={PRICE}
							title={t('Price')}
						/>
						{traitsFilterContent}
					</FilterContent>
				</Filter>
			</div>
			<FilterTags />
			<NFTGalleryContent
				nfts={traitsValuesFilteredNfts}
				disableImport
				loading={
					collectionLoading ||
					traitsValuesMapLoading ||
					traitsValuesFilteredNftsLoading ||
					statusFilteredNftsLoading ||
					priceFilteredNftsLoading
				}
				className="pb-4"
			/>
		</div>
	);
}
