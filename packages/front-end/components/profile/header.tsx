import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import EmojiAvatar from '../emojo-avatar';
import ProfileAvatar from './avatar';
import { Address } from '@ant-design/web3';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import Link from 'next/link';
import {
	IconArrowsDiagonal,
	IconArrowsDiagonalMinimize2,
	IconCopy,
	IconEdit,
	IconWorld,
} from '@tabler/icons-react';
import { Badge } from '../ui/badge';
import { FindFirstUserProfileQuery } from '@/apollo/gql/graphql';
import useMessage from 'antd/es/message/useMessage';
import { useAccount } from 'wagmi';
import { useTranslation } from 'next-i18next';
import ExpandableBannerHeader, {
	ExpandableBannerHeaderContent,
	ExpandableBannerHeaderContentLeft,
	ExpandableBannerHeaderContentRight,
} from '../expandable-banner-header';
import AddressBadge from '../address-badge';
import { useNFTsTotalValueInUSD } from '@/lib/hooks/use-nfts-sale-info';

export default function ProfileHeader({
	data,
	address,
}: {
	data?: FindFirstUserProfileQuery;
	address: string;
}) {
	const { t, i18n } = useTranslation('common');
	const [messageApi, contextHolder] = useMessage();
	const { address: myAddress } = useAccount();
	const nfts = useMemo(() => {
		return (
			data?.findFirstUserProfile?.importedNFTs.map((nft) => {
				return {
					contractAddress: nft.contractAddress as `0x${string}`,
					tokenId: nft.tokenId,
					chainId: nft.collection.chainId,
				};
			}) ?? []
		);
	}, [data]);
	const { data: portfolioValueUSD, loading: portfolioValueUSDLoading } =
		useNFTsTotalValueInUSD({
			nfts,
		});
	return (
		<div className="w-full">
			{contextHolder}
			<ExpandableBannerHeader
				loading={portfolioValueUSDLoading}
				banner={
					data?.findFirstUserProfile?.banner ? (
						<Image
							src={new URL(
								data.findFirstUserProfile.banner,
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
			>
				{(expand, toggle) => {
					return (
						<ExpandableBannerHeaderContent>
							<ExpandableBannerHeaderContentLeft>
								{expand && (
									<ProfileAvatar
										avatar={
											data?.findFirstUserProfile?.avatar
										}
										address={address}
										className="size-20"
									/>
								)}
								<div className="flex items-center min-w-0 flex-wrap">
									{!expand && (
										<ProfileAvatar
											avatar={
												data?.findFirstUserProfile
													?.avatar
											}
											address={address}
										/>
									)}
									{data?.findFirstUserProfile?.username ? (
										<h3 className="font-medium! leading-tight! text-foreground! text-[20px]! md:text-3xl! select-text">
											{data.findFirstUserProfile.username}
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
												t('Copy Address Successful'),
											);
										}}
									>
										<IconCopy />
									</Button>
									{myAddress === address && (
										<Link
											href={`/settings/profile`}
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
									{data?.findFirstUserProfile?.url && (
										<Link
											href={
												data.findFirstUserProfile?.url
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
								{data?.findFirstUserProfile?.username && (
									<AddressBadge
										address={address as `0x${string}`}
									/>
								)}
								{data?.findFirstUserProfile?.bio && (
									<p className="text-foreground text-sm">
										{data.findFirstUserProfile.bio}
									</p>
								)}
							</ExpandableBannerHeaderContentLeft>
							<ExpandableBannerHeaderContentRight>
								<div className="text-muted-foreground">
									<h5 className="text-xs">
										{t('PORTFOLIO VALUE')}
									</h5>
									<p className="text-foreground font-mono text-sm md:text-base">
										{portfolioValueUSD.toFixed(2)} USD
									</p>
								</div>
								{toggle}
							</ExpandableBannerHeaderContentRight>
						</ExpandableBannerHeaderContent>
					);
				}}
			</ExpandableBannerHeader>
		</div>
	);
}
