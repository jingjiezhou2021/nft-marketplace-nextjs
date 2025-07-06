import type { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import RainbowKitAllProvider from '../components/providers/RainbowKitAllProvider';

function App({ Component, pageProps }: AppProps) {
	return (
		<RainbowKitAllProvider>
			<Component {...pageProps} />
		</RainbowKitAllProvider>
	);
}

export default appWithTranslation(App);
