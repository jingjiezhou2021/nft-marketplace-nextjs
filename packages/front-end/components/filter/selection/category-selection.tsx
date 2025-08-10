import { useTranslation } from 'next-i18next';
import ChoiceSelection from '.';
import { Category } from '@/apollo/gql/graphql';
const NAME = 'category';
export default function CategorySelection() {
	const { t } = useTranslation('filter');
	return (
		<ChoiceSelection
			name={NAME}
			multiple={true}
			includeAll={true}
			data={Object.values(Category).map((val) => {
				// t("Art")
				// t('Photography');
				// t('Membership');
				// t('PFPs');
				// t('Gaming');
				return {
					value: val,
					label: t(val),
				};
			})}
		/>
	);
}
