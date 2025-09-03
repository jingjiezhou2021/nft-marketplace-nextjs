import { Listing, QueryMode } from '@/apollo/gql/graphql';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import { useMemo } from 'react';
import { LoadingMask, LoadingSpinner } from './loading';
import Link from 'next/link';
import CryptoPrice from './crypto-price';
import useNFTMetadata from '@/lib/hooks/use-nft-metadata';
import useNFTsSaleInfo from '@/lib/hooks/use-nfts-sale-info';
import { NFTDetailProps } from './nft/detail';
import { useQuery } from '@apollo/client';
import findNFT from '@/lib/graphql/queries/find-nft';

export type NFTCardData = {
	imageUrl: string;
	name: string;
	listing?: Listing;
	chainId: number | bigint | string;
};
export function CardWrapper({
	children,
	className,
	loading,
	...props
}: React.ComponentProps<typeof Card> & {
	loading?: boolean;
}) {
	return (
		<Card
			className={cn(
				'w-full py-0 rounded-lg overflow-hidden pb-2 gap-3 cursor-pointer hover:-translate-y-0.5 hover:scale-[1.01] active:scale-[1.005] shadow-xs duration-200 ease-out-circ transition-transform relative',
				className,
			)}
			{...props}
		>
			<LoadingMask
				loading={!!loading}
				className="flex justify-center items-center"
			>
				<LoadingSpinner size={64} />
			</LoadingMask>
			{children}
		</Card>
	);
}
export function CardContentWrapper({
	className,
	children,
	...props
}: Parameters<typeof CardContent>[0]) {
	return (
		<CardContent
			className={cn('w-full aspect-square relative', className)}
			{...props}
		>
			{children}
		</CardContent>
	);
}
export function CardFooterWrapper({
	className,
	children,
	...props
}: Parameters<typeof CardFooter>[0]) {
	return (
		<CardFooter
			className={cn('px-3 block', className)}
			{...props}
		>
			{children}
		</CardFooter>
	);
}
export default function NFTCard({
	nft,
	className,
	fontSmaller,
}: {
	nft: NFTDetailProps;
	className?: string;
	fontSmaller?: boolean;
}) {
	const { t, i18n } = useTranslation('common');
	const { data: nftData, loading: nftDataLoading } = useQuery(findNFT, {
		variables: {
			where: {
				contractAddress: {
					equals: nft.contractAddress,
					mode: QueryMode.Insensitive,
				},
				tokenId: {
					equals: nft.tokenId,
				},
				collection: {
					is: {
						chainId: {
							equals: nft.chainId,
						},
					},
				},
			},
		},
	});
	const { metadata, loading } = useNFTMetadata(
		nft.contractAddress as `0x${string}`,
		nft.tokenId,
		nft.chainId,
	);
	const nftsMemo = useMemo(() => {
		return [
			{
				contractAddress: nft.contractAddress as `0x${string}`,
				tokenId: nft.tokenId,
				chainId: nft.chainId,
			},
		];
	}, [nft]);
	const {
		lastSaleListing,
		topOfferListing,
		loading: saleInfoLoading,
	} = useNFTsSaleInfo({
		nfts: nftsMemo,
	});
	return (
		<CardWrapper
			className={cn('min-h-32', className)}
			loading={
				nftDataLoading ||
				loading ||
				saleInfoLoading ||
				metadata === undefined
			}
		>
			{metadata && (
				<Link
					href={`/nft/${nft.chainId}/${nft.contractAddress}/${
						nft.tokenId
					}`}
					locale={i18n.language}
					className="w-full h-full flex flex-col justify-between"
				>
					<CardContentWrapper>
						<Image
							src={metadata.image}
							alt="nft-card"
							unoptimized
							fill
						/>
					</CardContentWrapper>
					<CardFooterWrapper className="grow flex flex-col gap-1 items-start">
						<h3
							className={cn(
								'w-full font-bold text-sm pb-2 pt-3 text-nowrap text-ellipsis overflow-x-hidden',
								fontSmaller && 'text-xs',
							)}
						>
							{metadata.dispName}
						</h3>
						<div
							className={cn(
								'text-sm font-mono',
								fontSmaller && 'text-xs',
							)}
						>
							{nftData?.findFirstNFT?.activeItem?.listing ? (
								<CryptoPrice
									{...nftData.findFirstNFT.activeItem.listing}
									chainId={nft.chainId}
								/>
							) : (
								<p className="text-muted-foreground">
									{t(`Not listed yet`)}
								</p>
							)}
						</div>
						<div className="grid grid-cols-[auto_1fr] text-xs gap-1">
							{lastSaleListing && (
								<>
									<span className="text-muted-foreground text-nowrap">
										{t('Last sale')}:
									</span>
									<CryptoPrice
										{...lastSaleListing}
										className="origin-left scale-80"
									/>
								</>
							)}
							{topOfferListing && (
								<>
									<span className="text-muted-foreground text-nowrap">
										{t('Top offer')}:
									</span>
									<CryptoPrice
										{...topOfferListing}
										className="origin-left scale-80"
									/>
								</>
							)}
						</div>
					</CardFooterWrapper>
				</Link>
			)}
		</CardWrapper>
	);
}
