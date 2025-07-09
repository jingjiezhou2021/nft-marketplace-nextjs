import type { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import RainbowKitAllProvider from '../components/providers/RainbowKitAllProvider';
import '@/global.css';
import createApolloClient from '@/apollo';
import { ApolloProvider } from '@apollo/client';
import Layout from '@/components/layout';
const client = createApolloClient();
function App({ Component, pageProps }: AppProps) {
	return (
		<ApolloProvider client={client}>
			<RainbowKitAllProvider>
				<Layout>
					<Component {...pageProps} />
				</Layout>
			</RainbowKitAllProvider>
		</ApolloProvider>
	);
}

export default appWithTranslation(App);
