import { AppSidebar } from './app-sidebar';
import { SidebarInset, SidebarProvider } from './ui/sidebar';
import { SiteHeader } from './site-header';
import StatusBar from './status-bar';
export default function Layout({ children }) {
	return (
		<div className="overflow-hidden">
			<SidebarProvider
				style={
					{
						'--sidebar-width': 'calc(var(--spacing) * 64)',
						'--header-height': 'calc(var(--spacing) * 18)',
					} as React.CSSProperties
				}
			>
				<AppSidebar variant="inset" />
				<SidebarInset className="h-svh lg:h-[calc(100svh-16px)]">
					<SiteHeader />
					<div className="lg:ml-4 mt-4 grow-1 lg:pr-2 overflow-auto mx-2">
						{children}
					</div>
					<StatusBar className="hidden lg:flex" />
				</SidebarInset>
			</SidebarProvider>
		</div>
	);
}
