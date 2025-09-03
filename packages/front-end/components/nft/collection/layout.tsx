import Layout from '@/components/layout';
import { ReactElement } from 'react';
import { CollectionHeader } from './header';
import CollectionNav from './nav';
import { useParams } from 'next/navigation';
import { ChainIdParameter } from '@wagmi/core/internal';
import { config } from '@/components/providers/RainbowKitAllProvider';
export default function CollectionLayout({
	children,
}: {
	children: ReactElement;
}) {
	const params = useParams<{ chainId: string; address: string }>();
	const chainId = parseInt(params.chainId) as ChainIdParameter<
		typeof config
	>['chainId'];
	const address = params.address as `0x${string}`;
	return (
		<Layout>
			<CollectionHeader
				address={address}
				chainId={chainId}
			/>
			<CollectionNav className="sticky top-0 z-40 w-full max-w-full"></CollectionNav>
			{children}
		</Layout>
	);
}
