import { config } from '@/components/providers/RainbowKitAllProvider';
import useCollectionSaleInfo, {
	useCollectionsSaleInfo,
} from '@/lib/hooks/use-collection-sale-info';
import { ChainIdParameter } from '@wagmi/core/internal';
import { useQuery } from '@apollo/client';
import findCollection, {
	findCollections,
} from '@/lib/graphql/queries/find-collection';
import { Listing, QueryMode } from '@/apollo/gql/graphql';
import Image from 'next/image';
import useCollectionName, {
	useCollectionsNames,
} from '@/lib/hooks/use-collection-name';
import { LoadingMask, LoadingSpinner } from '@/components/loading';
import useCollectionCreatorAddress, {
	useCollectionsCreatorAddresses,
} from '@/lib/hooks/use-collection-creator-address';
import useUser, { useUsers } from '@/lib/hooks/use-user';
import { ReactElement, useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import CarouselMain, { CarouselMainItem } from '../carousel-main';
import CryptoPrice from '@/components/crypto-price';
import { Separator } from '@/components/ui/separator';
import EmojiAvatar from '@/components/emojo-avatar';
import useNFTMetadata from '@/lib/hooks/use-nft-metadata';
import { getNFTMetadata } from '@/lib/nft';
import { CollectionDetailProps } from '@/components/nft/collection';
import Link from 'next/link';
export function CollectionCarouselBannerItemUI({
	bannerItem,
	link,
	loading,
}: {
	bannerItem: {
		banner: string | ReactElement;
		name: string;
		author: string;
		nftExamplesImageUrl: string[];
		floorPrice:
			| (Pick<
					Listing,
					'erc20TokenAddress' | 'price' | 'erc20TokenName'
			  > & {
					chainId: ChainIdParameter<typeof config>['chainId'];
			  })
			| null
			| undefined;
		amount: number;
		totalVolume: string;
		listedPercentage: number;
	};
	link: string;
	loading?: boolean;
}) {
	const { t } = useTranslation('common');
	return (
		<CarouselMainItem
			key={bannerItem.name}
			className="cursor-pointer"
			link={link}
		>
			<div className="relative size-full">
				<LoadingMask
					loading={!!loading}
					className="flex justify-center items-center"
				>
					<LoadingSpinner size={48} />
				</LoadingMask>
				{typeof bannerItem.banner === 'string' ? (
					<Image
						src={new URL(
							bannerItem.banner,
							process.env.NEXT_PUBLIC_SERVER_ENDPOINT,
						).toString()}
						fill
						alt="nft-banner"
						className="object-cover"
					/>
				) : (
					bannerItem.banner
				)}
				<div className="absolute left-4 bottom-4 text-white z-10">
					<div className="flex gap-2 items-center">
						<h1 className="text-4xl">{bannerItem.name}</h1>
					</div>
					<div className="flex gap-2 items-center text-sm mt-2">
						<h2>{`${t('By')} ${bannerItem.author}`}</h2>
					</div>
					<div className="text-xs flex gap-1 sm:gap-4 px-4 py-3 bg-(--color-frosted) mt-3 rounded-xl border border-(--color-frosted)">
						{[
							[
								t('FLOOR PRICE'),
								bannerItem.floorPrice ? (
									<CryptoPrice
										key="crypto-price"
										{...bannerItem.floorPrice}
									/>
								) : (
									'-'
								),
							],
							[
								t('ITEMS'),
								`${bannerItem.amount.toLocaleString()}`,
							],
							[t('TOTAL VOLUME'), bannerItem.totalVolume],
							[
								t('LISTED'),
								`${bannerItem.listedPercentage.toFixed(1)}%`,
							],
						].map((item, index) => {
							return (
								<>
									<div key={index}>
										<div className="text-muted-foreground mb-2">
											{item[0]}
										</div>
										<div className="sm:text-sm">
											{item[1]}
										</div>
									</div>
									{index < 3 && (
										<Separator
											orientation="vertical"
											className="h-auto! bg-(--color-frosted)"
										/>
									)}
								</>
							);
						})}
					</div>
				</div>
				<div className="absolute right-4 bottom-4 z-10 hidden sm:flex gap-2">
					{bannerItem.nftExamplesImageUrl.map((e) => {
						return (
							<Image
								key={e}
								src={e}
								width={80}
								height={80}
								alt="nft-banner-example"
								className="rounded-lg"
								unoptimized
							/>
						);
					})}
				</div>
			</div>
		</CarouselMainItem>
	);
}
export function CollectionCarouselBannerItem({
	address,
	chainId,
}: CollectionDetailProps) {
	const { floorSaleListing, totalVolumeInUSD } = useCollectionSaleInfo(
		address,
		chainId,
	);
	const { name: collectionName, loading: collectionNameLoading } =
		useCollectionName(address, chainId);
	const { data: collectionCreatorAddress } = useCollectionCreatorAddress(
		chainId,
		address,
	);
	const { dispName: collectionCreatorName } = useUser(
		collectionCreatorAddress,
	);
	const { data, loading } = useQuery(findCollection, {
		variables: {
			where: {
				address: {
					equals: address,
					mode: QueryMode.Insensitive,
				},
				chainId: {
					equals: chainId,
				},
			},
		},
	});
	const [nftExamples, setNftsExamples] = useState<string[]>([]);
	useEffect(() => {
		Promise.all(
			data?.findFirstCollection?.importedNfts.slice(0, 3).map((nft) => {
				return getNFTMetadata(
					nft.contractAddress as `0x${string}`,
					nft.tokenId,
					nft.collection.chainId,
				);
			}) ?? [],
		).then((examples) => {
			setNftsExamples(examples.map((e) => e.image));
		});
	}, [data]);
	return (
		<CollectionCarouselBannerItemUI
			link={`/nft/${chainId}/${address}`}
			bannerItem={{
				name: collectionName,
				author: collectionCreatorName,
				floorPrice: floorSaleListing,
				totalVolume: `${totalVolumeInUSD.toFixed(2)} USD`,
				amount: data?.findFirstCollection?.importedNfts.length ?? 0,
				banner: data?.findFirstCollection?.banner ?? (
					<EmojiAvatar
						address={address}
						className="size-full absolute left-0 top-0"
						size={128}
					/>
				),
				nftExamplesImageUrl: nftExamples,
				listedPercentage:
					((data?.findFirstCollection?.importedNfts.filter(
						(nft) => nft.activeItem,
					).length ?? 0) /
						(data?.findFirstCollection?.importedNfts.length ?? 1)) *
					100,
			}}
			loading={loading || collectionNameLoading}
		/>
	);
}
export default function CollectionCarouselBanner({
	collections,
}: {
	collections: CollectionDetailProps[];
}) {
	return (
		<CarouselMain count={collections.length}>
			{collections.map((c) => (
				<CollectionCarouselBannerItem
					{...c}
					key={c.address}
				/>
			))}
		</CarouselMain>
	);
}
