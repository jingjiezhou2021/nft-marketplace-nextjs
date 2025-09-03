import NFTCard from './nft-card';
import ImportNFTCard from './import-nft-card';
import { cn } from '@/lib/utils';
import { NFTDetailProps } from './nft/detail';
import { Gallery } from './gallery';

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
		<Gallery
			loading={!!loading}
			className={cn(className)}
		>
			{nfts.map((n) => {
				return (
					<NFTCard
						nft={n}
						key={`${n.contractAddress}-${n.tokenId}`}
					/>
				);
			})}
			{!disableImport && <ImportNFTCard></ImportNFTCard>}
		</Gallery>
	);
}
