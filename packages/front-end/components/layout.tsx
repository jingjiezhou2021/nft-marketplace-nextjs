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
				<SidebarInset className="h-lvh lg:h-[calc(100vh-8px)]">
					<SiteHeader />
					<div className="ml-4 mt-4 grow-1 pr-2 overflow-scroll">
						{children}
					</div>
					<StatusBar className="hidden lg:flex" />
				</SidebarInset>
			</SidebarProvider>
		</div>
	);
}
