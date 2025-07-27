import { cn } from '@/lib/utils';
import NFTCard, { NFT } from './nft-card';
import ImportNFTCard from './import-nft-card';
export default function NFTGallery({
	nfts,
	className,
}: {
	nfts: NFT[];
	className?: string;
}) {
	return (
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
						key={n.name}
					/>
				);
			})}
			<ImportNFTCard></ImportNFTCard>
		</div>
	);
}
