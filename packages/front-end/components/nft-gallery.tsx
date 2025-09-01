import { FindFirstUserProfileQuery, QueryMode } from '@/apollo/gql/graphql';
import NFTCard from './nft-card';
import ImportNFTCard from './import-nft-card';
import { cn } from '@/lib/utils';
import { NFTDetailProps } from './nft/detail';
import { useQuery } from '@apollo/client';
import { findNFTs } from '@/lib/graphql/queries/find-nft';
import { LoadingMask, LoadingSpinner } from './loading';

export function NFTGalleryContent({
	className,
	nfts,
	disableImport,
	loading,
}: {
	nfts: NFTDetailProps[];
	className?: string;
	disableImport?: boolean;
	loading?: boolean;
}) {
	return (
		<div
			className={cn(
				'grid w-full grid-flow-row-dense gap-3 grid-cols-[repeat(auto-fill,minmax(177px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(172px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(178px,1fr))] xl:grid-cols-[repeat(auto-fill,minmax(186px,1fr))] 2xl:grid-cols-[repeat(auto-fill,minmax(218px,1fr))] relative',
				className,
			)}
		>
			<LoadingMask
				loading={!!loading}
				className="flex justify-center items-center z-30"
			>
				<LoadingSpinner size={64} />
			</LoadingMask>
			{nfts.map((n) => {
				return (
					<NFTCard
						nft={n}
						key={`${n.contractAddress}-${n.tokenId}`}
					/>
				);
			})}
			{!disableImport && <ImportNFTCard></ImportNFTCard>}
		</div>
	);
}
