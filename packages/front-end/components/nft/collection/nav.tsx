import InnerNav from '@/components/inner-nav';
import { useTranslation } from 'next-i18next';
import { ChainIdParameter } from '@wagmi/core/internal';
import { useParams } from 'next/navigation';
import { config } from '@/components/providers/RainbowKitAllProvider';
export default function CollectionNav({ className }: { className?: string }) {
	const { t } = useTranslation('common');
	const params = useParams<{ chainId: string; address: string }>();
	const chainId = parseInt(params.chainId) as ChainIdParameter<
		typeof config
	>['chainId'];
	const address = params.address as `0x${string}`;
	const links: { title: string; url: string }[] = [
		{
			title: t('Items'),
			url: `/nft/${chainId}/${address}/items`,
		},
		{
			title: t('Offers'),
			url: `/nft/${chainId}/${address}/offers`,
		},
		{
			title: t('Holders'),
			url: `/nft/${chainId}/${address}/holders`,
		},
		{
			title: t('Traits'),
			url: `/nft/${chainId}/${address}/traits`,
		},
		{
			title: t('Activity'),
			url: `/nft/${chainId}/${address}/activity`,
		},
	];
	return (
		<InnerNav
			className={className}
			links={links}
		></InnerNav>
	);
}
