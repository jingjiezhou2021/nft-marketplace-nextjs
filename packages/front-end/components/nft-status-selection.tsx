import ButtonSelection, { Choice } from './button-selection';
import { useTranslation } from 'react-i18next';
import useChoices from '@/hooks/use-choices';

export default function NFTStatusSelection() {
	const { t } = useTranslation('common');
	const [nftStatusChoices, setNftStatusChoices, handleToggle] = useChoices({
		includeAll: true,
		mutiple: false,
		data: [
			{
				value: t('Listed'),
				label: t('Listed'),
			},
			{
				value: t('Not Listed'),
				label: t('Not Listed'),
			},
		],
	});
	return (
		<ButtonSelection
			choices={nftStatusChoices}
			handleToggle={handleToggle}
		/>
	);
}
