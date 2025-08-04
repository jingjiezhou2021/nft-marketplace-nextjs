import { QueryMode } from '@/apollo/gql/graphql';
import { LoadingMask, LoadingSpinner } from '@/components/loading';
import ProfileAvatar from '@/components/profile/avatar';
import { config } from '@/components/providers/RainbowKitAllProvider';
import { Separator } from '@/components/ui/separator';
import { getAddressAbbreviation } from '@/lib/address';
import { getExplorerOfChain, getNameOfChain } from '@/lib/chain';
import findCollection from '@/lib/graphql/queries/find-collection';
import findNFT from '@/lib/graphql/queries/find-nft';
import findUserProfile from '@/lib/graphql/queries/find-user-profile';
import {
	getNFTCollectionCreatorAddress,
	getNFTCollectionName,
	getNFTMetadata,
} from '@/lib/nft';
import { useQuery } from '@apollo/client';
import { ChainIdParameter } from '@wagmi/core/internal';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function NFTDetailAbout({
	contractAddress,
	tokenId,
	chainId,
}: {
	contractAddress: `0x${string}`;
	tokenId: number;
	chainId: ChainIdParameter<typeof config>['chainId'];
}) {
	const { t } = useTranslation('common');
	const [ownerAddress, setOwnerAddress] = useState('');
	const [description, setDescription] = useState('');
	const [name, setName] = useState('');
	const [collectionName, setCollectionName] = useState('');
	useEffect(() => {
		getNFTCollectionCreatorAddress(contractAddress, chainId).then((res) => {
			if (res) {
				setOwnerAddress(res);
			}
		});
		getNFTMetadata(contractAddress, tokenId, chainId).then((res) => {
			if (res.description) {
				setDescription(res.description);
			}
			if (res.name) {
				setName(res.name);
			}
		});
		getNFTCollectionName(contractAddress, chainId).then((res) => {
			if (res) {
				setCollectionName(res);
			}
		});
	}, [contractAddress, chainId, tokenId]);
	const { data: ownerData, loading: ownerLoading } = useQuery(
		findUserProfile,
		{
			variables: {
				where: {
					address: {
						equals: ownerAddress,
						mode: QueryMode.Insensitive,
					},
				},
			},
		},
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
	const owner = ownerData?.findFirstUserProfile;
	const collectionDescription =
		collectionData?.findFirstCollection?.description;
	let ownerDispName = owner?.username;
	if (!ownerDispName) {
		ownerDispName = getAddressAbbreviation(ownerAddress);
	}
	useEffect(() => {
		console.log('owner loading:', ownerLoading);
	}, [ownerLoading]);
	return (
		<div>
			<div>
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
				{ownerLoading ? (
					<LoadingMask loading={ownerLoading}>
						<div className="size-full flex items-center justify-center">
							<LoadingSpinner size={18} />
						</div>
					</LoadingMask>
				) : (
					<div className="text-xs text-muted-foreground flex items-center">
						{t('A collection by')}
						&nbsp;
						<div className="flex items-center cursor-pointer">
							<ProfileAvatar
								avatar={owner?.avatar}
								address={ownerAddress}
								className="inline-block size-4 mr-1 ml-2"
							/>
							<span className="text-foreground">
								{ownerDispName}
							</span>
						</div>
					</div>
				)}

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
