import { FindFirstUserProfileQuery, Listing, Nft } from '@/apollo/gql/graphql';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { getCryptoIcon } from '@/lib/currency';
import { getNFTMetadata } from '@/lib/nft';
import { cn } from '@/lib/utils';
import { IconLoader2 } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { ValuesType } from 'utility-types';
import { LoadingMask, LoadingSpinner } from './loading';
import Link from 'next/link';
import CryptoPrice from './crypto-price';
import useNFTMetadata from '@/lib/hooks/use-nft-metadata';
import useNFTsSaleInfo, {
	useNFTsLastSale,
} from '@/lib/hooks/use-nfts-sale-info';

export type NFTCardData = {
	imageUrl: string;
	name: string;
	listing?: Listing;
	chainId: number | bigint | string;
};
function Wrapper<T extends React.ComponentProps<'div'>>({
	El,
	className,
}: {
	El: React.FC<T>;
	className: string;
}) {
	const WrappedFC = ({
		className: classNameInner,
		children,
		...props
	}: T) => {
		return (
			<El
				className={cn(className, classNameInner)}
				{...(props as T)}
			>
				{children}
			</El>
		);
	};
	return WrappedFC;
}
export function CardWrapper({
	children,
	className,
	...props
}: Parameters<typeof Card>[0]) {
	const Wrapped = Wrapper({
		El: Card,
		className:
			'w-full py-0 rounded-lg overflow-hidden pb-2 gap-3 cursor-pointer hover:-translate-y-0.5 hover:scale-[1.01] active:scale-[1.005] shadow-xs duration-200 ease-out-circ transition-transform relative',
	});
	return (
		<Wrapped
			className={className}
			{...props}
		>
			{children}
		</Wrapped>
	);
}
export function CardContentWrapper({
	className,
	children,
	...props
}: Parameters<typeof CardContent>[0]) {
	const Wrapped = Wrapper({
		El: CardContent,
		className: 'w-full aspect-square relative',
	});
	return (
		<Wrapped
			className={className}
			{...props}
		>
			{children}
		</Wrapped>
	);
}
export function CardFooterWrapper({
	className,
	children,
	...props
}: Parameters<typeof CardFooter>[0]) {
	const Wrapped = Wrapper({
		El: CardFooter,
		className: 'px-3 block',
	});
	return (
		<Wrapped
			className={className}
			{...props}
		>
			{children}
		</Wrapped>
	);
}
export default function NFTCard({
	nft,
	className,
	fontSmaller,
}: {
	nft: ValuesType<
		NonNullable<
			FindFirstUserProfileQuery['findFirstUserProfile']
		>['importedNFTs']
	>;
	className?: string;
	fontSmaller?: boolean;
}) {
	const { t, i18n } = useTranslation('common');
	const { metadata, loading } = useNFTMetadata(
		nft.contractAddress as `0x${string}`,
		nft.tokenId,
		nft.collection.chainId,
	);
	const nftsMemo = useMemo(() => {
		return [
			{
				contractAddress: nft.contractAddress as `0x${string}`,
				tokenId: nft.tokenId,
				chainId: nft.collection.chainId,
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
	const dispName = metadata?.name ?? `# ${nft.tokenId}`;
	return (
		<CardWrapper className={cn('min-h-32', className)}>
			{loading || metadata === undefined ? (
				<div className="size-full relative">
					<LoadingMask
						loading={
							loading || saleInfoLoading || metadata === undefined
						}
						className="flex justify-center items-center"
					>
						<LoadingSpinner size={64} />
					</LoadingMask>
				</div>
			) : (
				<Link
					href={`/nft/${nft.collection.chainId}/${nft.contractAddress}/${
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
							{dispName}
						</h3>
						<div
							className={cn(
								'text-sm font-mono',
								fontSmaller && 'text-xs',
							)}
						>
							{nft.activeItem?.listing ? (
								<CryptoPrice
									{...nft.activeItem.listing}
									chainId={nft.collection.chainId}
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
										{t('Last sale:')}
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
										{t('Top offer:')}
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
