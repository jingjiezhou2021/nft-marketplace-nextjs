import { QueryMode } from '@/apollo/gql/graphql';
import { ALL, Filter, FilterContent } from '@/components/filter';
import ChoiceSelection from '@/components/filter/selection';
import { FilterTags } from '@/components/filter/tag';
import { Gallery } from '@/components/gallery';
import CollectionLayout from '@/components/nft/collection/layout';
import TraitCard from '@/components/nft/collection/trait-card';
import { config } from '@/components/providers/RainbowKitAllProvider';
import findCollection from '@/lib/graphql/queries/find-collection';
import useNFTsMetadataMap from '@/lib/hooks/use-nfts-metadata-map';
import { Range } from '@/lib/hooks/use-range';
import { getRanges } from '@/lib/utils';
import { NextPageWithLayout } from '@/pages/_app';
import { useQuery } from '@apollo/client';
import { ChainIdParameter } from '@wagmi/core/internal';
import { GetServerSideProps, InferGetStaticPropsType } from 'next';
import { SSRConfig, useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useParams, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

export const getServerSideProps: GetServerSideProps<SSRConfig> = async ({
	locale,
}) => {
	return {
		props: {
			...(await serverSideTranslations(locale!, ['common', 'filter'])),
			// Will be passed to the page component as props
		},
	};
};
const Page: NextPageWithLayout = (
	_props: Awaited<InferGetStaticPropsType<typeof getServerSideProps>>,
) => {
	const searchParams = useSearchParams();
	const targetTraits = searchParams.get('traits')?.split(',');
	const { t } = useTranslation('common');
	const params = useParams<{ chainId: string; address: string }>();
	const chainId = parseInt(params.chainId) as ChainIdParameter<
		typeof config
	>['chainId'];
	const address = params.address as `0x${string}`;
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
	const { data: traitValuesMap, loading: traitsValuesMapLoading } =
		useNFTsMetadataMap(allNftDetailProps);
	const traitsFilterContent = (
		<>
			<h4>{t('Traits')}</h4>
			<ChoiceSelection
				name={'traits'}
				includeAll
				multiple
				data={Array.from(traitValuesMap?.keys() ?? []).map((trait) => {
					return {
						value: trait,
						label: trait,
					};
				})}
			></ChoiceSelection>
		</>
	);
	return (
		<div className="mt-4 w-full">
			<div className="mb-4">
				<Filter>
					<FilterContent>{traitsFilterContent}</FilterContent>
				</Filter>
			</div>
			<FilterTags />
			<Gallery loading={collectionLoading || traitsValuesMapLoading}>
				{Array.from(traitValuesMap?.entries() ?? [])
					.filter((tv) => {
						if (
							targetTraits === undefined ||
							targetTraits.includes(ALL)
						) {
							return true;
						} else {
							return targetTraits.includes(tv[0]);
						}
					})
					.map((tv) => {
						if (
							Array.from(tv[1].keys()).every((vk) => {
								return typeof vk === 'number';
							})
						) {
							return getRanges(
								Array.from(tv[1].keys()) as number[],
								5,
							)
								.map((pair): Range => {
									return {
										data: {
											min: pair[0],
											max: pair[1],
										},
										meta: null,
									};
								})
								.map((r) => {
									const queryValue = JSON.stringify(r);
									return (
										<TraitCard
											key={queryValue}
											trait_type={tv[0]}
											queryValue={queryValue}
											address={address}
											chainId={chainId}
										/>
									);
								});
						} else {
							return Array.from(tv[1].keys()).map((v) => {
								return (
									<TraitCard
										trait_type={tv[0]}
										queryValue={v as string}
										address={address}
										chainId={chainId}
										key={v}
									/>
								);
							});
						}
					})}
			</Gallery>
		</div>
	);
};
Page.GetLayout = CollectionLayout;
export default Page;
