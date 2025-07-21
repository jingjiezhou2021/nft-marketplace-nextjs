import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { IconLanguage, IconUser } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function SettingsSidebar() {
	const { t } = useTranslation('common');
	const pathname = usePathname();
	// Menu items.
	const items = [
		{
			title: t('Profile'),
			url: '/settings/profile',
			icon: IconUser,
		},
		{
			title: t('Language'),
			url: '/settings/language',
			icon: IconLanguage,
		},
	];
	return (
		<Sidebar
			className="static bg-transparent w-full md:w-(--sidebar-width) h-auto md:h-full border-b border-b-border md:border-0"
			sidebarInnerClassName="bg-transparent"
			variant="inset"
			collapsible="none"
		>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>{t('Settings')}</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{items.map((item) => {
								const current = pathname.endsWith(item.url);
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
												<item.icon />
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
		</Sidebar>
	);
}
