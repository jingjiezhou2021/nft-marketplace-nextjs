import Link from 'next/link';
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
} from '../ui/navigation-menu';
import { useTranslation } from 'next-i18next';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function ProfileNav({
	address,
	className,
}: {
	address: string;
	className: string;
}) {
	const { t, i18n } = useTranslation('common');
	const pathname = usePathname();
	const links: { title: string; url: string }[] = [
		{
			title: t('NFTs'),
			url: `/profile/${address}`,
		},
		{
			title: t('Listings'),
			url: `/profile/${address}/listings`,
		},
		{
			title: t('Offers'),
			url: `/profile/${address}/offers`,
		},
		{
			title: t('Activities'),
			url: `/profile/${address}/activities`,
		},
	];
	return (
		<NavigationMenu className={cn('px-4 py-2 bg-background', className)}>
			<NavigationMenuList className="gap-3 md:gap-6">
				{links.map((l) => {
					const current = pathname.endsWith(l.url);
					return (
						<NavigationMenuItem key={l.url}>
							<NavigationMenuLink
								asChild
								className={cn(
									'text-muted-foreground px-0 bg-transparent! hover:border-b hover:border-b-primary rounded-none',
									current &&
										'text-primary hover:text-primary',
								)}
							>
								<Link
									href={l.url}
									locale={i18n.language}
								>
									{l.title}
								</Link>
							</NavigationMenuLink>
						</NavigationMenuItem>
					);
				})}
			</NavigationMenuList>
		</NavigationMenu>
	);
}
