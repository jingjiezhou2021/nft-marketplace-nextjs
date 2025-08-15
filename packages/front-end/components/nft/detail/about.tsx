import { QueryMode } from '@/apollo/gql/graphql';
import { LoadingMask, LoadingSpinner } from '@/components/loading';
import ProfileAvatar from '@/components/profile/avatar';
import { config } from '@/components/providers/RainbowKitAllProvider';
import { Separator } from '@/components/ui/separator';
import useNFTMetadata from '@/lib/hooks/use-nft-metadata';
import { getAddressAbbreviation } from '@/lib/address';
import { getExplorerOfChain, getNameOfChain } from '@/lib/chain';
import findCollection from '@/lib/graphql/queries/find-collection';
import findNFT from '@/lib/graphql/queries/find-nft';
import findUserProfile from '@/lib/graphql/queries/find-user-profile';
import { useQuery } from '@apollo/client';
import { ChainIdParameter } from '@wagmi/core/internal';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { NFTDetailProps } from '.';
import useUser from '@/lib/hooks/use-user';
import useCollectionName from '@/lib/hooks/use-collection-name';
import useCollectionCreatorAddress from '@/lib/hooks/use-collection-creator-address';

export default function NFTDetailAbout({
	contractAddress,
	tokenId,
	chainId,
}: NFTDetailProps) {
	const { t, i18n } = useTranslation('common');
	const { metadata, loading: metadataLoading } = useNFTMetadata(
		contractAddress,
		tokenId,
		chainId,
	);
	const description = metadata?.description;
	const name = metadata?.name;
	const { data: ownerAddress } = useCollectionCreatorAddress(
		chainId,
		contractAddress,
	);
	const { data: collectionData } = useQuery(findCollection, {
		variables: {
			where: {
				address: {
					equals: contractAddress,
					mode: QueryMode.Insensitive,
				},
				chainId: {
					equals: chainId,
				},
			},
		},
	});
	const collectionDescription =
		collectionData?.findFirstCollection?.description;
	const {
		user: collectionCreator,
		loading: collectionCreatorLoading,
		dispName: collectionCreatorDispName,
	} = useUser(ownerAddress);
	const { name: collectionName, loading: collectionNameLoading } =
		useCollectionName(contractAddress, chainId);
	return (
		<div>
			<div className="relative">
				<LoadingMask
					loading={metadataLoading}
					className="flex justify-center items-center"
				>
					<LoadingSpinner size={14} />
				</LoadingMask>
				<h3 className="text-foreground font-bold">
					{t('About')}&nbsp;{name}
				</h3>
				<p className="text-sm text-muted-foreground">{description}</p>
			</div>
			<Separator className="my-4 " />
			<div className="relative min-h-8">
				<h3 className="text-foreground font-bold">
					{t('About')}&nbsp;{collectionName}
				</h3>
				<div className="text-xs text-muted-foreground flex items-center">
					{t('A collection by')}
					&nbsp;
					<Link
						href={`/profile/${collectionCreator?.address}`}
						locale={i18n.language}
						className="flex items-center cursor-pointer"
					>
						<ProfileAvatar
							avatar={collectionCreator?.avatar}
							address={ownerAddress}
							className="inline-block size-4 mr-1 ml-2"
						/>
						<span className="text-foreground">
							{collectionCreatorDispName}
						</span>
					</Link>
				</div>
				<LoadingMask
					loading={
						collectionCreatorLoading ||
						metadataLoading ||
						collectionNameLoading
					}
					className="top-0"
				>
					<div className="size-full flex items-center justify-center">
						<LoadingSpinner size={18} />
					</div>
				</LoadingMask>

				<p className="text-sm text-muted-foreground">
					{collectionDescription}
				</p>
			</div>
			<Separator className="my-4 " />
			<div className="flex flex-col select-text gap-3">
				<div className="flex justify-between">
					<span className="text-sm text-muted-foreground leading-normal">
						{t('Contract Address')}
					</span>
					<Link
						className="no-underline text-primary"
						href={
							new URL(
								contractAddress,
								getExplorerOfChain(chainId!),
							)
						}
					>
						{getAddressAbbreviation(contractAddress)}
					</Link>
				</div>
				<div className="flex justify-between">
					<span className="text-sm text-muted-foreground leading-normal">
						{t('Token ID')}
					</span>
					<span className="no-underline">{tokenId}</span>
				</div>
				<div className="flex justify-between">
					<span className="text-sm text-muted-foreground leading-normal">
						{t('Chain')}
					</span>
					<span className="no-underline">
						{getNameOfChain(chainId!)}
					</span>
				</div>
			</div>
		</div>
	);
}
