import { AppSidebar } from './app-sidebar';
import { SidebarProvider, SidebarTrigger } from './ui/sidebar';

export default function Layout({ children }) {
	return (
		<div>
			<SidebarProvider>
				<AppSidebar />
				<main>
					<SidebarTrigger />
					{children}
				</main>
			</SidebarProvider>
		</div>
	);
}
