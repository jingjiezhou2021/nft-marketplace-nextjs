import '@rainbow-me/rainbowkit/styles.css';
import {
	darkTheme,
	getDefaultConfig,
	lightTheme,
	Locale,
	RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { http, WagmiProvider } from 'wagmi';
import { mainnet, sepolia, hardhat } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { RainbowKitProviderProps } from '@rainbow-me/rainbowkit/dist/components/RainbowKitProvider/RainbowKitProvider';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/router';
export const chains = [sepolia, hardhat] as const;
export const config = getDefaultConfig({
	projectId: '51647972c0a9da02ca0e99a6bafefc81',
	appName: 'NFT Marketplace',
	chains,
	transports: {
		[sepolia.id]: http(
			`https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`,
		),
		[hardhat.id]: http('http://localhost:8545'),
	},
	ssr: true, // If your dApp uses server side rendering (SSR)
});

const RainbowKitAllProvider = (
	props: RainbowKitProviderProps & { children: ReactNode },
) => {
	const { theme } = useTheme();
	const { locale } = useRouter();
	const queryClient = new QueryClient();
	return (
		<WagmiProvider config={config}>
			<QueryClientProvider client={queryClient}>
				<RainbowKitProvider
					locale={locale as Locale}
					{...props}
					theme={
						theme === 'light'
							? lightTheme({
									accentColor: '#7e22ce',
								})
							: darkTheme({
									accentColor: '#7e22ce',
								})
					}
				>
					{props.children}
				</RainbowKitProvider>
			</QueryClientProvider>
		</WagmiProvider>
	);
};
export default RainbowKitAllProvider;
