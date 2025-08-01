import { cn } from '@/lib/utils';
import NFTCard, { NFTCardData } from './nft-card';
import ImportNFTCard from './import-nft-card';
import type { FindFirstUserProfileQuery } from '@/apollo/gql/graphql';
import { Filter, FilterContent } from './filter';
import { useTranslation } from 'next-i18next';
import ChainSelection from './filter/selection/chain-selection';
import NFTStatusSelection from './filter/selection/nft-status-selection';
import CategorySelection from './filter/selection/category-selection';
export default function NFTGallery({
	nfts,
	className,
}: {
	nfts: FindFirstUserProfileQuery['findFirstUserProfile']['importedNFTs'];
	className?: string;
}) {
	const { t } = useTranslation('common');
	return (
		<div className="w-full">
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
			<div
				className={cn(
					'grid w-full grid-flow-row-dense gap-3 grid-cols-[repeat(auto-fill,minmax(177px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(172px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(178px,1fr))] xl:grid-cols-[repeat(auto-fill,minmax(186px,1fr))] 2xl:grid-cols-[repeat(auto-fill,minmax(218px,1fr))]',
					className,
				)}
			>
				{nfts.map((n) => {
					return (
						<NFTCard
							nft={n}
							key={`${n.contractAddress}-${n.tokenId}`}
						/>
					);
				})}
				<ImportNFTCard></ImportNFTCard>
			</div>
		</div>
	);
}
