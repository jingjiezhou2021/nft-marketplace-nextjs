import { FindFirstUserProfileQuery, Listing, Nft } from '@/apollo/gql/graphql';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { getCryptoIcon } from '@/lib/currency';
import { getNFTMetadata } from '@/lib/nft';
import { cn } from '@/lib/utils';
import { IconLoader2 } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ValuesType } from 'utility-types';
import { LoadingSpinner } from './loading';
import Link from 'next/link';

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
function PriceTag({
	listing,
	chainId,
}: {
	listing: Listing;
	chainId: string | number | bigint;
}) {
	return (
		<p>
			{getCryptoIcon(chainId, listing.erc20TokenAddress)}
			<span>{listing.price}</span>
			<span className="text-muted-foreground">
				&nbsp;{listing.erc20TokenName}
			</span>
		</p>
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
	const [nftCardData, setNftCarddata] = useState<NFTCardData>();
	const [loading, setLoading] = useState(true);
	useEffect(() => {
		setLoading(true);
		getNFTMetadata(
			nft.contractAddress as `0x${string}`,
			nft.tokenId,
			nft.collection.chainId,
		)
			.then((metadata) => {
				return {
					...metadata,
					name: metadata.name ?? `#${nft.tokenId}`,
					listing: nft.activeItem?.listing,
					chainId: nft.collection.chainId,
				};
			})
			.then((cardData) => {
				setLoading(false);
				setNftCarddata({
					imageUrl: cardData.image,
					listing: cardData.listing,
					name: cardData.name,
					chainId: cardData.chainId,
				});
			});
	}, [nft]);
	return (
		<CardWrapper className={cn('min-h-32', className)}>
			{loading ? (
				<div className="size-full relative">
					<LoadingSpinner className="absolute left-1/2 top-1/2 -translate-1/2" />
				</div>
			) : (
				<Link
					href={`/nft/${nftCardData.chainId}/${nft.contractAddress}/${
						nft.tokenId
					}`}
					locale={i18n.language}
					className="w-full"
				>
					<CardContentWrapper>
						<Image
							src={nftCardData.imageUrl}
							alt="nft-card"
							fill
						/>
					</CardContentWrapper>
					<CardFooterWrapper>
						<h3
							className={cn(
								'font-bold text-sm pb-2 pt-3',
								fontSmaller && 'text-xs',
							)}
						>
							{nftCardData.name}
						</h3>
						<div
							className={cn(
								'text-sm font-mono',
								fontSmaller && 'text-xs',
							)}
						>
							{nftCardData.listing ? (
								<PriceTag
									listing={nftCardData.listing}
									chainId={nftCardData.chainId}
								/>
							) : (
								<p className="text-muted-foreground">
									{t(`Not listed yet`)}
								</p>
							)}
						</div>
					</CardFooterWrapper>
				</Link>
			)}
		</CardWrapper>
	);
}
