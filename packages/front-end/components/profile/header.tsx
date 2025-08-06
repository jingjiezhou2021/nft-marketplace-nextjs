import { cn } from '@/lib/utils';
import { useState } from 'react';
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
import ExpandableBannerHeader from '../expandable-banner-header';

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
	return (
		<div className="w-full">
			{contextHolder}
			<ExpandableBannerHeader
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
				{(expand, setExpand) => {
					return (
						<div className="flex w-full min-w-0 flex-col pb-4 lg:grid lg:grid-cols-[1fr_auto] lg:items-end lg:justify-between xl:gap-4 xl:pb-5 relative z-30">
							<div className="flex flex-col gap-1 md:gap-4">
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
									<Badge
										variant="outline"
										className="border-border bg-[oklch(var(--muted-foreground)_/_0.5)]"
									>
										<Address
											ellipsis
											address={address}
											className="font-light! leading-tight! text-secondary-foreground! text-xs! select-text opacity-100"
										/>
									</Badge>
								)}
								{data?.findFirstUserProfile?.bio && (
									<p className="text-foreground text-sm">
										{data.findFirstUserProfile.bio}
									</p>
								)}
							</div>
							<div className="pt-2 flex justify-between gap-6 md:gap-8">
								<div className="text-muted-foreground">
									<h5 className="text-xs">
										{t('PORTFOLIO VALUE')}
									</h5>
									<p className="text-foreground font-mono text-sm md:text-base">
										0.04 ETH
									</p>
								</div>
								<Button
									variant="outline"
									className="text-foreground hover:text-primary"
									onClick={() => {
										setExpand(!expand);
									}}
								>
									{expand ? (
										<IconArrowsDiagonalMinimize2 />
									) : (
										<IconArrowsDiagonal />
									)}
								</Button>
							</div>
						</div>
					);
				}}
			</ExpandableBannerHeader>
		</div>
	);
}
