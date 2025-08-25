import { useEffect, useState } from 'react';
import ButtonSwitch from './button-switch';
import { useTranslation } from 'next-i18next';
import {
	CRYPTO_DISPLAY_TYPE,
	useCryptoDisplay,
} from './providers/crypto-display-provider';

export default function CryptoDisplaySwitch() {
	const { t } = useTranslation('common');
	const { method, toggle } = useCryptoDisplay();
	const [currencyChoice, setCurrencyChoice] = useState(0);
	useEffect(() => {
		setCurrencyChoice(method === CRYPTO_DISPLAY_TYPE.CRYPTO ? 0 : 1);
	}, [method]);
	return (
		<ButtonSwitch
			buttons={[t('Crypto'), t('USD')].map((item, index) => ({
				content: (
					<span
						className="text-xs font-light"
						key={item}
					>
						{item}
					</span>
				),
				clickCb() {
					toggle(
						index === 0
							? CRYPTO_DISPLAY_TYPE.CRYPTO
							: CRYPTO_DISPLAY_TYPE.USD,
					);
				},
			}))}
			choice={currencyChoice}
		/>
	);
}
