import { useTranslation } from 'next-i18next';

export default function WalletNotConnected() {
	const { t } = useTranslation('common');
	return (
		<div className="w-full h-full flex justify-center items-center">
			<div className="text-muted-foreground">
				{t('Wallet Not Connected')}
			</div>
		</div>
	);
}
