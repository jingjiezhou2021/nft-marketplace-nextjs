import { ReadonlyURLSearchParams } from 'next/navigation';
import { useTraitsValuesFilteredNfts } from '@/lib/hooks/use-nfts-metadata-map';
import useNFTsSaleInfo from '@/lib/hooks/use-nfts-sale-info';
import { config } from '@/components/providers/RainbowKitAllProvider';
import { ChainIdParameter } from '@wagmi/core/internal';
import { useQuery } from '@apollo/client';
import findCollection from '@/lib/graphql/queries/find-collection';
import { QueryMode } from '@/apollo/gql/graphql';
import { useEffect, useMemo } from 'react';
import {
	CardContentWrapper,
	CardFooterWrapper,
	CardWrapper,
} from '@/components/nft-card';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import NFTAvatar from '../image';
import { useTranslation } from 'next-i18next';
import CryptoPrice from '@/components/crypto-price';
import { RangeFilterTagInner } from '@/components/filter/range';
import { Range } from '@/lib/hooks/use-range';
import { Badge } from '@/components/ui/badge';

export default function TraitCard({
	trait_type,
	queryValue,
	address,
	chainId,
	className,
}: {
	trait_type: string;
	queryValue: string;
	address: `0x${string}`;
	chainId: ChainIdParameter<typeof config>['chainId'];
	className?: string;
}) {
	let range: Range | null = null;
	try {
		range = JSON.parse(queryValue);
		if (typeof range !== 'object') {
			range = null;
		}
	} catch (err) {}
	const { t, i18n } = useTranslation('common');
	const searchParams = useMemo(() => {
		return new ReadonlyURLSearchParams({
			[trait_type]: queryValue,
		});
	}, [trait_type, queryValue]);
	const { data: collection, loading: collectionLoading } = useQuery(
		findCollection,
		{
			variables: {
				where: {
					chainId: {
						equals: chainId,
					},
					address: {
						equals: address,
						mode: QueryMode.Insensitive,
					},
				},
			},
			fetchPolicy: 'network-only',
			nextFetchPolicy: 'cache-first',
		},
	);
	const allNftDetailProps = useMemo(() => {
		return (
			collection?.findFirstCollection?.importedNfts.map((nft) => {
				return {
					contractAddress: nft.contractAddress as `0x${string}`,
					tokenId: nft.tokenId,
					chainId: nft.collection.chainId,
				};
			}) ?? []
		);
	}, [collection]);
	const { data: filteredNfts, loading: filteredNftsLoading } =
		useTraitsValuesFilteredNfts(allNftDetailProps, searchParams);
	const {
		floorSaleListing,
		topOfferListing,
		loading: saleInfoLoading,
	} = useNFTsSaleInfo({
		nfts: filteredNfts,
	});
	return (
		<CardWrapper
			className={cn('min-h-32', className)}
			loading={
				saleInfoLoading || filteredNftsLoading || collectionLoading
			}
		>
			<Badge className="absolute right-2 top-2 z-10">
				+{filteredNfts.length}
			</Badge>
			<Link
				href={`/nft/${chainId}/${address}/items?${searchParams.toString()}`}
				locale={i18n.language}
				className="w-full h-full flex flex-col"
			>
				<CardContentWrapper className="p-2">
					<div
						className={cn(
							'grid grid-cols-2 grid-rows-2 gap-1 size-full',
						)}
					>
						{filteredNfts.slice(0, 4).map((nft) => {
							return (
								<NFTAvatar
									className="rounded-md size-full"
									key={nft.tokenId}
									contractAddress={nft.contractAddress}
									chainId={nft.chainId}
									tokenId={nft.tokenId}
								/>
							);
						})}
					</div>
				</CardContentWrapper>
				<CardFooterWrapper className="text-xs flex flex-col items-start gap-1">
					<div className="flex flex-wrap gap-1">
						<span className="text-muted-foreground text-nowrap">
							{trait_type}:
						</span>
						<div>
							{range ? (
								<RangeFilterTagInner
									min={range.data.min}
									max={range.data.max}
								/>
							) : (
								queryValue
							)}
						</div>
					</div>
					{floorSaleListing && (
						<div className="flex flex-wrap gap-1">
							<span className="text-muted-foreground text-nowrap">
								{t('Floor price')}:
							</span>
							<CryptoPrice
								{...floorSaleListing}
								className="origin-left scale-80"
							/>
						</div>
					)}
					{topOfferListing && (
						<div className="flex flex-wrap gap-1">
							<span className="text-muted-foreground text-nowrap">
								{t('Top offer')}:
							</span>
							<CryptoPrice
								{...topOfferListing}
								className="origin-left scale-80"
							/>
						</div>
					)}
				</CardFooterWrapper>
			</Link>
		</CardWrapper>
	);
}
