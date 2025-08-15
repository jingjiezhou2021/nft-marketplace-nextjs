import ExpandableBannerHeader, {
	ExpandableBannerHeaderContent,
	ExpandableBannerHeaderContentLeft,
	ExpandableBannerHeaderContentRight,
} from '@/components/expandable-banner-header';
import { config } from '@/components/providers/RainbowKitAllProvider';
import useUser from '@/lib/hooks/use-user';
import findCollection from '@/lib/graphql/queries/find-collection';
import { getNFTCollectionCreatorAddress } from '@/lib/nft';
import { useQuery } from '@apollo/client';
import { ChainIdParameter } from '@wagmi/core/internal';
import useMessage from 'antd/es/message/useMessage';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import ProfileAvatar from '@/components/profile/avatar';
import { Address } from '@ant-design/web3';
import { Separator } from '@radix-ui/react-separator';
import { Button } from '@/components/ui/button';
import { IconCopy, IconEdit, IconStack2, IconWorld } from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { getIconOfChain, getNameOfChain } from '@/lib/chain';
import { useTranslation } from 'next-i18next';
import { LoadingMask, LoadingSpinner } from '@/components/loading';
import useCollectionName from '@/lib/hooks/use-collection-name';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import EmojiAvatar from '@/components/emojo-avatar';
export function CollectionHeader({
	address,
	chainId,
}: {
	address: `0x${string}`;
	chainId: ChainIdParameter<typeof config>['chainId'];
}) {
	const { address: userAddress } = useAccount();
	const [collectionCreatorAddress, setCollectionCreatorAddress] =
		useState('');
	const [
		collectionCreatorAddressLoading,
		setCollectionCreatorAddressLoading,
	] = useState(true);
	const [messageApi, contextHolder] = useMessage();
	const { t, i18n } = useTranslation('common');
	const { data, loading } = useQuery(findCollection, {
		variables: {
			where: {
				address: {
					equals: address,
				},
				chainId: {
					equals: chainId,
				},
			},
		},
	});
	const { dispName: collectionCreatorDispName } = useUser(
		collectionCreatorAddress,
	);
	const { name: collectionName, loading: collectionNameLoading } =
		useCollectionName(address, chainId);
	useEffect(() => {
		setCollectionCreatorAddressLoading(true);
		getNFTCollectionCreatorAddress(address, chainId).then((res) => {
			if (res) {
				setCollectionCreatorAddress(res);
			}
			setCollectionCreatorAddressLoading(false);
		});
	}, [address, chainId]);
	return (
		<div>
			{contextHolder}
			<ExpandableBannerHeader
				banner={
					data?.findFirstCollection?.banner ? (
						<Image
							src={new URL(
								data?.findFirstCollection?.banner,
								process.env.NEXT_PUBLIC_SERVER_ENDPOINT,
							).toString()}
							fill
							alt="profile-banner"
							className="object-cover"
						/>
					) : (
						<EmojiAvatar
							address={address}
							className="size-full absolute left-0 top-0"
							size={128}
						/>
					)
				}
				loading={
					loading ||
					collectionCreatorAddressLoading ||
					collectionNameLoading
				}
			>
				{(expand, toggle) => {
					return (
						<>
							<ExpandableBannerHeaderContent>
								<ExpandableBannerHeaderContentLeft>
									{expand && (
										<ProfileAvatar
											avatar={
												data?.findFirstCollection
													?.avatar
											}
											address={address}
											className="size-20"
										/>
									)}
									<div className="flex items-center min-w-0 flex-wrap">
										{!expand && (
											<ProfileAvatar
												address={address}
												avatar={
													data?.findFirstCollection
														?.avatar
												}
											/>
										)}
										{data?.findFirstCollection?.nickname ||
										collectionName ? (
											<h3 className="font-medium! leading-tight! text-foreground! text-[20px]! md:text-3xl! select-text">
												{data?.findFirstCollection
													?.nickname ??
													collectionName}
											</h3>
										) : (
											<Address
												ellipsis
												address={address}
												className="font-medium! leading-tight! text-foreground! text-[20px]! md:text-3xl! select-text"
											/>
										)}
										<Separator
											orientation="vertical"
											className="ml-4 mr-1 w-[2px]! h-6! bg-border"
										/>
										<Button
											variant="ghost"
											className="text-foreground hover:text-primary"
											onClick={() => {
												navigator.clipboard.writeText(
													address,
												);
												messageApi.success(
													t(
														'Copy Address Successful',
													),
												);
											}}
										>
											<IconCopy />
										</Button>
										{userAddress?.toLowerCase() ===
											collectionCreatorAddress.toLowerCase() && (
											<Link
												href={`/nft/${chainId}/${address}/edit`}
												locale={i18n.language}
											>
												<Button
													variant="ghost"
													className="text-foreground hover:text-primary"
												>
													<IconEdit />
												</Button>
											</Link>
										)}
										{data?.findFirstCollection?.url && (
											<Link
												href={
													data.findFirstCollection.url
												}
											>
												<Button
													variant="ghost"
													className="text-foreground hover:text-primary"
												>
													<IconWorld />
												</Button>
											</Link>
										)}
									</div>
									<div className="flex items-center gap-1">
										<Badge
											variant="outline"
											className="border-border bg-[oklch(var(--muted-foreground)_/_0.5)]"
										>
											{t('By')}&nbsp;
											{collectionCreatorDispName}
										</Badge>
										<Badge
											variant="outline"
											className="border-border bg-[oklch(var(--muted-foreground)_/_0.5)]"
										>
											{getIconOfChain(chainId)}
											&nbsp;
											{getNameOfChain(chainId)}
										</Badge>
										<Badge
											variant="outline"
											className="border-border bg-[oklch(var(--muted-foreground)_/_0.5)]"
										>
											<IconStack2></IconStack2>
											&nbsp;
											{
												data?.findFirstCollection
													?.importedNfts.length
											}
										</Badge>
									</div>
								</ExpandableBannerHeaderContentLeft>
								<ExpandableBannerHeaderContentRight>
									<div className="text-muted-foreground">
										<h5 className="text-xs">
											{t('TOP OFFER')}
										</h5>
										<p className="text-foreground font-mono text-sm md:text-base">
											0.00 ETH
										</p>
									</div>
									<div className="text-muted-foreground">
										<h5 className="text-xs">
											{t('FLOOR PRICE')}
										</h5>
										<p className="text-foreground font-mono text-sm md:text-base">
											0.00 ETH
										</p>
									</div>
									<div className="text-muted-foreground">
										<h5 className="text-xs">
											{t('TOTAL VOLUME')}
										</h5>
										<p className="text-foreground font-mono text-sm md:text-base">
											0.00 ETH
										</p>
									</div>
									{toggle}
								</ExpandableBannerHeaderContentRight>
							</ExpandableBannerHeaderContent>
						</>
					);
				}}
			</ExpandableBannerHeader>
		</div>
	);
}
