import { AppSidebar } from './app-sidebar';
import { SidebarInset, SidebarProvider } from './ui/sidebar';
import { SiteHeader } from './site-header';
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
				<SidebarInset>
					<SiteHeader />
					<div className="ml-4 mt-4 h-full mr-2">{children}</div>
				</SidebarInset>
			</SidebarProvider>
		</div>
	);
}
