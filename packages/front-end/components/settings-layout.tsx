import { ReactElement } from 'react';
import { SidebarInset, SidebarProvider } from './ui/sidebar';
import { SettingsSidebar } from './settings-sidebar';
import Layout from './layout';

export default function SettingsLayout({
	children,
}: {
	children: ReactElement;
}) {
	return (
		<Layout>
			<SidebarProvider className="min-h-0 h-full has-data-[variant=inset]:bg-transparent flex-col md:flex-row">
				<SettingsSidebar />
				<SidebarInset>
					<div className="mx-auto h-full w-full md:w-2/3">
						{children}
					</div>
				</SidebarInset>
			</SidebarProvider>
		</Layout>
	);
}
