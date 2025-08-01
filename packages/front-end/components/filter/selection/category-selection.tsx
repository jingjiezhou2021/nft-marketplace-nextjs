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
					value: t('Art'),
					label: t('Art'),
				},
				{
					value: t('Gaming'),
					label: t('Gaming'),
				},
				{
					value: t('PFPs'),
					label: t('PFPs'),
				},
				{
					value: t('Photography'),
					label: t('Photography'),
				},
			]}
		/>
	);
}
