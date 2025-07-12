import { AppSidebar } from './app-sidebar';
import { SidebarInset, SidebarProvider } from './ui/sidebar';
import { SiteHeader } from './site-header';
export default function Layout({ children }) {
	return (
		<div>
			<SidebarProvider
				style={
					{
						'--sidebar-width': 'calc(var(--spacing) * 72)',
						'--header-height': 'calc(var(--spacing) * 18)',
					} as React.CSSProperties
				}
			>
				<AppSidebar variant="inset" />
				<SidebarInset>
					<SiteHeader />
					{children}
				</SidebarInset>
			</SidebarProvider>
		</div>
	);
}
