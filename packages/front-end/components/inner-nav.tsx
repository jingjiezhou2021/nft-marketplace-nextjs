import { cn } from '@/lib/utils';
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
} from './ui/navigation-menu';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'next-i18next';

export default function InnerNav({
	className,
	links,
}: {
	className?: string;
	links: { title: string; url: string }[];
}) {
	const pathname = usePathname();
	const { i18n } = useTranslation('common');
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
									'text-muted-foreground px-0 bg-transparent! rounded-none',
									current &&
										'text-primary hover:text-primary border-b-primary border-b',
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
