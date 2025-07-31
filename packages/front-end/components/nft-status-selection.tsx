import { useTranslation } from 'react-i18next';
import ChoiceSelection from './choice-selection';

export default function NFTStatusSelection() {
	const { t } = useTranslation('common');
	return (
		<ChoiceSelection
			data={[
				{
					value: t('Listed'),
					label: t('Listed'),
				},
				{
					value: t('Not Listed'),
					label: t('Not Listed'),
				},
			]}
			name="nft-status"
			includeAll
			multiple={false}
		/>
	);
}
