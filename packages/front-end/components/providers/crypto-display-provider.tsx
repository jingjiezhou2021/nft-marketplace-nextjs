import { useContext, useState } from 'react';
import { createContext } from 'react';
export enum CRYPTO_DISPLAY_TYPE {
	CRYPTO,
	USD,
}
export const CryptoDisplayContext = createContext({
	method: CRYPTO_DISPLAY_TYPE.CRYPTO,
	toggle: (newVal?: CRYPTO_DISPLAY_TYPE) => {},
});

export function CryptoDisplayProvider({ children }) {
	const [CryptoDisplayMethod, setCryptoDisplayMethod] = useState(
		CRYPTO_DISPLAY_TYPE.CRYPTO,
	);

	const toggleMethod = (newVal?: CRYPTO_DISPLAY_TYPE) => {
		if (newVal) {
			setCryptoDisplayMethod(newVal);
		} else {
			setCryptoDisplayMethod((prev) =>
				prev === CRYPTO_DISPLAY_TYPE.CRYPTO
					? CRYPTO_DISPLAY_TYPE.USD
					: CRYPTO_DISPLAY_TYPE.CRYPTO,
			);
		}
	};

	return (
		<CryptoDisplayContext.Provider
			value={{ method: CryptoDisplayMethod, toggle: toggleMethod }}
		>
			{children}
		</CryptoDisplayContext.Provider>
	);
}
export function useCryptoDisplay() {
	return useContext(CryptoDisplayContext);
}
