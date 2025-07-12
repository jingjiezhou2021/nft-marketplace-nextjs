import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { SearchInput } from './ui/SearchInput';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { IconBrandGithub } from '@tabler/icons-react';

export function SiteHeader() {
	return (
		<header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
			<div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
				<SidebarTrigger className="-ml-1" />
				<Separator
					orientation="vertical"
					className="mx-2 data-[orientation=vertical]:h-4"
				/>
				<div className="px-3 w-3/5">
					<SearchInput />
				</div>
				{/* <Input /> */}
				<div className="grow flex justify-end items-center gap-4">
					<ConnectButton
						accountStatus={{
							smallScreen: 'avatar',
							largeScreen: 'full',
						}}
						showBalance={{
							smallScreen: false,
							largeScreen: true,
						}}
					/>
					<IconBrandGithub className="text-primary hidden xl:block" />
				</div>
				{/* <div className="ml-auto flex items-center gap-2">
					<Button
						variant="ghost"
						asChild
						size="sm"
						className="hidden sm:flex"
					>
						<a
							href="https://github.com/shadcn-ui/ui/tree/main/apps/v4/app/(examples)/dashboard"
							rel="noopener noreferrer"
							target="_blank"
							className="dark:text-foreground"
						>
							GitHub
						</a>
					</Button>
				</div> */}
			</div>
		</header>
	);
}
