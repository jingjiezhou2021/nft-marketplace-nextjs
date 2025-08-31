import { useTranslation } from 'next-i18next';
import InnerNav from '../inner-nav';

export default function ProfileNav({
	address,
	className,
}: {
	address: string;
	className: string;
}) {
	const { t } = useTranslation('common');
	const links: { title: string; url: string }[] = [
		{
			title: t('NFTs'),
			url: `/profile/${address}/nfts`,
		},
		{
			title: t('Listings'),
			url: `/profile/${address}/listings`,
		},
		{
			title: t('Offers'),
			url: `/profile/${address}/offers`,
		},
		{
			title: t('Activity'),
			url: `/profile/${address}/activity`,
		},
	];
	return (
		<InnerNav
			links={links}
			className={className}
		/>
	);
}
