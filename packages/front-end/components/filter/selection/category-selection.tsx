import { useTranslation } from 'next-i18next';
import ChoiceSelection from '.';
const NAME = 'category';
export default function CategorySelection() {
	const { t } = useTranslation('filter');
	return (
		<ChoiceSelection
			name={NAME}
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
