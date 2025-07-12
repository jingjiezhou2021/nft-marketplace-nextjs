import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { RainbowKitProviderProps } from '@rainbow-me/rainbowkit/dist/components/RainbowKitProvider/RainbowKitProvider';

const config = getDefaultConfig({
	projectId: '51647972c0a9da02ca0e99a6bafefc81',
	appName: 'NFT Marketplace',
	chains: [sepolia, mainnet],
	ssr: true, // If your dApp uses server side rendering (SSR)
});

const queryClient = new QueryClient();

const RainbowKitAllProvider = (
	props: RainbowKitProviderProps & { children: ReactNode },
) => {
	return (
		<WagmiProvider config={config}>
			<QueryClientProvider client={queryClient}>
				<RainbowKitProvider {...props}>
					{props.children}
				</RainbowKitProvider>
			</QueryClientProvider>
		</WagmiProvider>
	);
};
export default RainbowKitAllProvider;
