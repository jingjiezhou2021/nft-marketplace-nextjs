import type { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import RainbowKitAllProvider from '../components/providers/RainbowKitAllProvider';
import '@/global.css';
import createApolloClient from '@/apollo';
import { ApolloProvider } from '@apollo/client';
import Layout from '@/components/layout';
import { ThemeProvider } from '@/components/providers/theme-provider';
const client = createApolloClient();
function App({ Component, pageProps }: AppProps) {
	return (
		<ApolloProvider client={client}>
			<ThemeProvider
				attribute="class"
				defaultTheme="system"
				enableSystem
			>
				<RainbowKitAllProvider>
					<Layout>
						<Component {...pageProps} />
					</Layout>
				</RainbowKitAllProvider>
			</ThemeProvider>
		</ApolloProvider>
	);
}

export default appWithTranslation(App);
