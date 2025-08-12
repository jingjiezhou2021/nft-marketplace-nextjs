import { useTranslation } from 'next-i18next';

export default function NFTAlreadyListed() {
	const { t } = useTranslation('common');
	return (
		<div className="w-full h-full flex justify-center items-center">
			<div className="text-muted-foreground">
				{t('This NFT is already listed')}
			</div>
		</div>
	);
}
