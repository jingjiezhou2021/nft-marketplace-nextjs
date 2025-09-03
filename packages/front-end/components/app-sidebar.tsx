import {
	Home,
	Inbox,
	Search,
	Settings,
	Store,
	ChartBar,
	CircleUser,
	Banknote,
} from 'lucide-react';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { NavUser } from './nav-user';
import { useTranslation } from 'next-i18next';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAccount } from 'wagmi';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const pathname = usePathname();
	const { t } = useTranslation('common');
	const { address } = useAccount();
	// Menu items.
	const items = [
		{
			title: t('Home'),
			url: '/',
			icon: Home,
		},
		{
			title: t('NFT'),
			url: '/nft',
			icon: Inbox,
		},
		{
			title: t('Activity'),
			url: '/activity',
			icon: ChartBar,
		},
		{
			title: t('Profile'),
			url: `/profile${address ? `/${address}` : ''}`,
			icon: CircleUser,
		},
		{
			title: t('Proceeds'),
			url: `/proceeds`,
			icon: Banknote,
		},
		{
			title: t('Settings'),
			url: '/settings',
			icon: Settings,
		},
	];
	return (
		<Sidebar
			collapsible="icon"
			variant="inset"
		>
			<SidebarHeader className="pt-5">
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className="data-[slot=sidebar-menu-button]:!p-1.5"
						>
							<Link href="/">
								<Store className="!size-5 text-primary" />
								<span className="text-base font-semibold">
									{t('NFT Marketplace Demo')}
								</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>{t('Application')}</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{items.map((item) => {
								const current =
									pathname &&
									((pathname === '/' && item.url === '/') ||
										(item.url !== '/' &&
											pathname.startsWith(item.url)));
								return (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton
											asChild
											className={cn(
												'transition-colors duration-300 ease-in-out',
												current &&
													'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
											)}
										>
											<Link href={item.url}>
												<item.icon
													className={cn(
														current
															? 'text-primary-foreground'
															: 'text-primary',
													)}
												/>
												<span>{item.title}</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<NavUser />
			</SidebarFooter>
		</Sidebar>
	);
}
