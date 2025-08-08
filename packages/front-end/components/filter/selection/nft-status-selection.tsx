import { useTranslation } from 'next-i18next';
import ChoiceSelection from '.';

export default function NFTStatusSelection() {
	const { t } = useTranslation('filter');
	return (
		<ChoiceSelection
			data={[
				{
					value: 'Listed',
					label: t('Listed'),
				},
				{
					value: 'Not Listed',
					label: t('Not Listed'),
				},
			]}
			name="nft-status"
			includeAll
			multiple={false}
		/>
	);
}
