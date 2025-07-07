import type { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import RainbowKitAllProvider from '../components/providers/RainbowKitAllProvider';
import '@/public/styles/global.css';
import createApolloClient from '@/apollo';
import { ApolloProvider } from '@apollo/client';
const client = createApolloClient();
function App({ Component, pageProps }: AppProps) {
	return (
		<ApolloProvider client={client}>
			<RainbowKitAllProvider>
				<Component {...pageProps} />
			</RainbowKitAllProvider>
		</ApolloProvider>
	);
}

export default appWithTranslation(App);
