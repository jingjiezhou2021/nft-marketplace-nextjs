import type { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import RainbowKitAllProvider from '../components/providers/RainbowKitAllProvider';
import '@/global.css';
import createApolloClient from '@/apollo';
import { ApolloProvider } from '@apollo/client';
import Layout from '@/components/layout';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { NextPage } from 'next';
import { ReactElement, ReactNode } from 'react';
const client = createApolloClient();
export type NextPageWithLayout<P = any, IP = P> = NextPage<P, IP> & {
	GetLayout?: ({ children }: { children: ReactElement }) => ReactNode;
};
type AppPropsWithLayout = AppProps & {
	Component: NextPageWithLayout;
};
function App({ Component, pageProps }: AppPropsWithLayout) {
	const GetLayout = Component.GetLayout ?? Layout;
	return (
		<ApolloProvider client={client}>
			<ThemeProvider
				attribute="class"
				defaultTheme="system"
				enableSystem
			>
				<RainbowKitAllProvider>
					<GetLayout>
						<Component {...pageProps} />
					</GetLayout>
				</RainbowKitAllProvider>
			</ThemeProvider>
		</ApolloProvider>
	);
}

export default appWithTranslation(App);
