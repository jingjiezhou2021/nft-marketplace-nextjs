import { cn } from '@/lib/utils';
import type { FindFirstUserProfileQuery } from '@/apollo/gql/graphql';
import { Filter, FilterContent } from '../filter';
import { useTranslation } from 'next-i18next';
import ChainSelection from '../filter/selection/chain-selection';
import NFTStatusSelection from '../filter/selection/nft-status-selection';
import CategorySelection from '../filter/selection/category-selection';
import { FilterTags } from '../filter/tag';
import { NFTGalleryContent } from '../nft-gallery';
export default function ProfileNFTGallery({
	nfts,
	className,
	disableImport,
}: {
	nfts: NonNullable<
		FindFirstUserProfileQuery['findFirstUserProfile']
	>['importedNFTs'];
	className?: string;
	disableImport?: boolean;
}) {
	const { t } = useTranslation('common');
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
				nfts={nfts}
				disableImport={disableImport}
			/>
		</div>
	);
}
