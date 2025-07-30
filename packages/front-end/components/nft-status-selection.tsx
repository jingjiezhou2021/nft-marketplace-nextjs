import { useState } from 'react';
import ButtonSelection, { Choice } from './button-selection';
import { useTranslation } from 'react-i18next';

export default function NFTStatusSelection() {
	const { t } = useTranslation('common');
	const [nftStatusChoices, setNftStatusChoices] = useState<Choice<string>[]>([
		{
			value: t('All'),
			label: t('All'),
			selected: false,
		},
		{
			value: t('Listed'),
			label: t('Listed'),
			selected: false,
		},
		{
			value: t('Not Listed'),
			label: t('Not Listed'),
			selected: false,
		},
	]);
	return (
		<ButtonSelection
			choices={nftStatusChoices}
			handleToggle={() => {}}
		/>
	);
}
