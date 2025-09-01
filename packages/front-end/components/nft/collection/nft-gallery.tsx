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
import { useEffect, useState } from 'react';
import { NFTDetailProps } from '../detail';
import { ChainIdParameter } from '@wagmi/core/internal';
import { config } from '@/components/providers/RainbowKitAllProvider';
import { useQuery } from '@apollo/client';
import findCollection from '@/lib/graphql/queries/find-collection';
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
	const [traitValuesMap, setTraitValuesMap] =
		useState<Map<string, Map<string | number, number>>>();
	const [calculating, setCalculating] = useState(true);
	useEffect(() => {
		if (collection?.findFirstCollection?.importedNfts) {
			setCalculating(true);
			Promise.all(
				collection.findFirstCollection.importedNfts.map((n) => {
					return getNFTMetadata(
						n.contractAddress as `0x${string}`,
						n.tokenId,
						n.collection.chainId,
					);
				}),
			).then((arr: NFTMetadata[]) => {
				const map = getTraitValuesMap(arr);
				setTraitValuesMap(map);
				setCalculating(false);
			});
		}
	}, [collection?.findFirstCollection?.importedNfts]);
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
						<CollapsibleFilter
							title={tvs[0]}
							key={tvs[0]}
						>
							<ChoiceSelection
								name={tvs[0]}
								includeAll
								multiple
								data={Array.from(tvs[1].entries()).map(
									(vcs) => {
										return {
											value: vcs[0],
											label: vcs[0],
											selected: false,
										};
									},
								)}
							></ChoiceSelection>
						</CollapsibleFilter>
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
						<CollapsibleFilter
							title={t('Traits')}
							defaultOpen
						>
							{traitsFilterContent}
						</CollapsibleFilter>
					</FilterContent>
				</Filter>
			</div>
			<FilterTags />
			<NFTGalleryContent
				nfts={
					collection?.findFirstCollection?.importedNfts.map((nft) => {
						return {
							contractAddress:
								nft.contractAddress as `0x${string}`,
							tokenId: nft.tokenId,
							chainId: nft.collection.chainId,
						};
					}) ?? []
				}
				disableImport
				loading={collectionLoading || calculating}
			/>
		</div>
	);
}
