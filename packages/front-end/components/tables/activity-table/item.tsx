import { getIconOfChain } from '@/lib/chain';
import useCollectionName from '@/lib/hooks/use-collection-name';
import useNFTMetadata from '@/lib/hooks/use-nft-metadata';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import ProfileAvatar from '@/components/profile/avatar';
import { LoadingMask, LoadingSpinner } from '@/components/loading';
import { ChainIdParameter } from '@wagmi/core/internal';
import { config } from '@/components/providers/RainbowKitAllProvider';
import { useTranslation } from 'next-i18next';

export default function ItemColumn({
	chainId,
	compact,
	address,
	tokenId,
}: {
	chainId: ChainIdParameter<typeof config>['chainId'];
	address: `0x${string}`;
	tokenId: number;
	compact?: boolean;
}) {
	const { metadata, loading: metadataLoading } = useNFTMetadata(
		address,
		tokenId,
		chainId,
	);
	const { name: collectionName, loading: collectionNameLoading } =
		useCollectionName(address, chainId);
	const { i18n } = useTranslation('common');
	return (
		<div className="flex gap-2 items-center relative">
			<LoadingMask
				loading={collectionNameLoading || metadataLoading}
				className="flex justify-center items-center"
			>
				<LoadingSpinner size={24} />
			</LoadingMask>
			<Link
				className={cn(
					'size-[32px] rounded-md overflow-hidden md:size-[64px] relative',
					compact && 'size-[32px]!',
				)}
				href={`/nft/${chainId}/${address}/${tokenId}`}
				locale={i18n.language}
			>
				{!compact && (
					<div className="absolute right-0 bottom-0 z-10">
						{getIconOfChain(chainId)}
					</div>
				)}
				<ProfileAvatar
					className="size-full rounded-md"
					address={address}
					avatar={metadata?.image}
				/>
			</Link>
			<div
				className={cn(
					'flex flex-col gap-2 max-w-32',
					compact && 'gap-0',
				)}
			>
				<Link
					className="font-bold overflow-x-hidden text-ellipsis whitespace-nowrap"
					href={`/nft/${chainId}/${address}/${tokenId}`}
					locale={i18n.language}
				>
					{metadata?.dispName}
				</Link>
				<Link
					className="text-muted-foreground overflow-x-hidden text-ellipsis whitespace-nowrap"
					href={`/nft/${chainId}/${address}`}
					locale={i18n.language}
				>
					{collectionName}
				</Link>
			</div>
		</div>
	);
}
