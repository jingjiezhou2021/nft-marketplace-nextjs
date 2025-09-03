'use client';

import {
	IconCreditCard,
	IconDotsVertical,
	IconLogout,
	IconNotification,
	IconUserCircle,
} from '@tabler/icons-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from '@/components/ui/sidebar';
import useUser from '@/lib/hooks/use-user';
import { useAccount } from 'wagmi';
import ProfileAvatar from './profile/avatar';
import AddressBadge from './address-badge';
import { useTranslation } from 'next-i18next';
import { LoadingMask, LoadingSpinner } from './loading';
import { useRouter } from 'next/router';
import { useAccountModal } from '@rainbow-me/rainbowkit';
import { SquarePen, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';

export function NavUser() {
	const router = useRouter();
	const { openAccountModal } = useAccountModal();

	const { isMobile } = useSidebar();
	const { address } = useAccount();
	const { user, dispName, loading } = useUser(address);
	const { t, i18n } = useTranslation('common');
	const [open, setOpen] = useState(false);
	useEffect(() => {
		if (open) {
			if (!address) {
				setOpen(false);
			}
		}
	}, [open, address]);
	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu
					open={open}
					onOpenChange={setOpen}
				>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground relative cursor-pointer"
						>
							<LoadingMask
								loading={loading}
								className="flex justify-center items-center"
							>
								<LoadingSpinner size={24} />
							</LoadingMask>
							{address ? (
								<>
									<ProfileAvatar
										className="size-8"
										address={address}
										avatar={user?.avatar}
									/>
									<div className="grid flex-1 text-left text-sm leading-tight gap-y-1">
										<span className="truncate font-medium">
											{dispName}
										</span>
										{user && user?.username && (
											<AddressBadge
												address={
													user.address as `0x${string}`
												}
												className="-ml-2"
											/>
										)}
									</div>
									<IconDotsVertical className="ml-auto size-4" />
								</>
							) : (
								<div>{t('Wallet Not Connected')}</div>
							)}
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
						side={isMobile ? 'bottom' : 'right'}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								{address && (
									<>
										<ProfileAvatar
											className="size-8"
											address={address}
											avatar={user?.avatar}
										/>
										<div className="grid flex-1 text-left text-sm leading-tight">
											<span className="truncate font-medium">
												{dispName}
											</span>
											{user && user?.username && (
												<AddressBadge
													address={
														user.address as `0x${string}`
													}
													className="-ml-2"
												/>
											)}
										</div>
									</>
								)}
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem
								className="cursor-pointer"
								onClick={() => {
									router.push('/profile', undefined, {
										locale: i18n.language,
									});
								}}
							>
								<IconUserCircle className="text-primary" />
								{t('Profile')}
							</DropdownMenuItem>
							<DropdownMenuItem
								className="cursor-pointer"
								onClick={() => {
									router.push(
										'/settings/profile',
										undefined,
										{
											locale: i18n.language,
										},
									);
								}}
							>
								<SquarePen className="text-primary" />
								{t('Edit Profile')}
							</DropdownMenuItem>
							<DropdownMenuItem
								className="cursor-pointer"
								onClick={() => {
									router.push('/proceeds', undefined, {
										locale: i18n.language,
									});
								}}
							>
								<IconCreditCard className="text-primary" />
								{t('Proceeds')}
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							className="cursor-pointer"
							onClick={() => {
								openAccountModal?.();
							}}
						>
							<Wallet className="text-primary" />
							{t('Wallet')}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
