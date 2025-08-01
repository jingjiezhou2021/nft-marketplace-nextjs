import { useTranslation } from 'react-i18next';
import ChoiceSelection from '.';
export default function CategorySelection() {
	const { t } = useTranslation('common');
	return (
		<ChoiceSelection
			name="category"
			multiple={true}
			includeAll={true}
			data={[
				{
					value: 'Art',
					label: t('Art'),
				},
				{
					value: 'Gaming',
					label: t('Gaming'),
				},
				{
					value: 'PFPs',
					label: t('PFPs'),
				},
				{
					value: 'Photography',
					label: t('Photography'),
				},
			]}
		/>
	);
}
