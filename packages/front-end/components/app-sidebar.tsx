import {
	Home,
	Inbox,
	Search,
	Settings,
	Store,
	ChartBar,
	CircleUser,
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

const user = {
	name: 'shadcn',
	email: 'm@example.com',
	avatar: '/avatars/shadcn.jpg',
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { t } = useTranslation('common');
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
			url: '/profile',
			icon: CircleUser,
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
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className="data-[slot=sidebar-menu-button]:!p-1.5"
						>
							<a href="#">
								<Store className="!size-5 text-primary" />
								<span className="text-base font-semibold">
									{t('NFT Marketplace Demo')}
								</span>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Application</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{items.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild>
										<Link href={item.url}>
											<item.icon className="text-primary" />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={user} />
			</SidebarFooter>
		</Sidebar>
	);
}
