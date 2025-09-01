import useNFTMetadata from '@/lib/hooks/use-nft-metadata';
import { NFTDetailProps } from './detail';
import ProfileAvatar from '../profile/avatar';
import { cn } from '@/lib/utils';
import { LoadingMask, LoadingSpinner } from '../loading';

export default function NFTAvatar({
	contractAddress,
	tokenId,
	chainId,
	className,
}: NFTDetailProps & { className?: string }) {
	const { metadata, loading } = useNFTMetadata(
		contractAddress,
		tokenId,
		chainId,
	);
	return (
		<div className="relative">
			<LoadingMask
				loading={loading}
				className="flex justify-center items-center"
			>
				<LoadingSpinner size={24} />
			</LoadingMask>
			<ProfileAvatar
				className={cn(className)}
				address={contractAddress}
				avatar={metadata?.image}
			/>
		</div>
	);
}
