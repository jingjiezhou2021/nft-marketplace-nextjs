import { useTranslation } from 'next-i18next';

export default function NotOwnerOfCollection() {
	const { t } = useTranslation('common');
	return (
		<div className="w-full h-full flex justify-center items-center">
			<div className="text-muted-foreground">
				{t('You are not the owner of this collection')}
			</div>
		</div>
	);
}
