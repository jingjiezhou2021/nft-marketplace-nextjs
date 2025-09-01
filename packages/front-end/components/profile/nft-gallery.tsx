import { cn } from '@/lib/utils';
import {
	QueryMode,
	type FindFirstUserProfileQuery,
} from '@/apollo/gql/graphql';
import { Filter, FilterContent } from '../filter';
import { useTranslation } from 'next-i18next';
import ChainSelection from '../filter/selection/chain-selection';
import NFTStatusSelection from '../filter/selection/nft-status-selection';
import CategorySelection from '../filter/selection/category-selection';
import { FilterTags } from '../filter/tag';
import { NFTGalleryContent } from '../nft-gallery';
import { NFTDetailProps } from '../nft/detail';
import { useQuery } from '@apollo/client';
import findUserProfile from '@/lib/graphql/queries/find-user-profile';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
export default function ProfileNFTGallery({
	address,
	className,
	disableImport,
}: {
	className?: string;
	disableImport?: boolean;
	address: `0x${string}`;
}) {
	const { t } = useTranslation('common');
	const { loading, data } = useQuery(findUserProfile, {
		variables: {
			where: {
				address: {
					equals: address,
					mode: QueryMode.Insensitive,
				},
			},
		},
		fetchPolicy: 'network-only',
		nextFetchPolicy: 'cache-first',
	});
	const searchParams = useSearchParams();
	const filteredNfts = useMemo(() => {
		const status = searchParams.get('nft-status');
		const category = searchParams.get('category');
		const chain = searchParams.get('chain');
		return data?.findFirstUserProfile?.importedNFTs
			.filter((nft) => {
				if (status === 'all' || status === null) {
					return true;
				} else {
					if (status === 'Listed') {
						return nft.activeItem;
					} else {
						return !nft.activeItem;
					}
				}
			})
			.filter((nft) => {
				if (category === 'all' || category === null) {
					return true;
				} else {
					const categories = category.split(',');
					return categories.includes(nft.collection.category);
				}
			})
			.filter((nft) => {
				if (chain === 'all' || chain === null) {
					return true;
				} else {
					const chainIds = chain.split(',');
					return chainIds.includes(nft.collection.chainId.toString());
				}
			});
	}, [data, searchParams]);
	return (
		<div className={cn('w-full', className)}>
			<div className="w-full mb-4">
				<Filter>
					<FilterContent>
						<h4>{t('Status')}</h4>
						<NFTStatusSelection />
						<hr />
						<h4>{t('Category')}</h4>
						<CategorySelection />
						<h4>{t('Chains')}</h4>
						<ChainSelection />
					</FilterContent>
				</Filter>
			</div>
			<FilterTags />
			<NFTGalleryContent
				nfts={
					filteredNfts?.map((nft) => {
						return {
							contractAddress:
								nft.contractAddress as `0x${string}`,
							tokenId: nft.tokenId,
							chainId: nft.collection.chainId,
						};
					}) ?? []
				}
				disableImport={disableImport}
				loading={loading}
			/>
		</div>
	);
}
