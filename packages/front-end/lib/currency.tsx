import { EthereumCircleColorful, USDTColorful } from '@ant-design/web3-icons';
import { ReactNode } from 'react';
import { base, hardhat, sepolia } from 'viem/chains';

export enum Currency {
	USD,
	ETH,
}
export const SEPOLIA_AAVE_USDT = '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0';
export const SEPOLIA_AAVE_WETH = '0xC558DBdd856501FCd9aaF1E62eae57A9F0629a3c';
export const CHAIN_CURRENCY_ADDRESS = {
	[sepolia.id]: {
		WETH: SEPOLIA_AAVE_WETH,
		USDT: SEPOLIA_AAVE_USDT,
	},
	[base.id]: {
		WETH: '',
		USDT: '',
	},
	[hardhat.id]: {
		WETH: '',
		USDT: '',
	},
};
export function getCryptoIcon(
	chainId: string | bigint | number,
	tokenContractAddress: string,
) {
	debugger;
	if (typeof chainId === 'string') {
		chainId = parseInt(chainId);
	}
	const map: Record<number, Record<string, ReactNode>> = {
		[sepolia.id]: {
			[SEPOLIA_AAVE_USDT]: (
				<>
					<USDTColorful />
				</>
			),
			[SEPOLIA_AAVE_WETH]: (
				<>
					<EthereumCircleColorful />
				</>
			),
		},
	};
	return map[Number(chainId)][tokenContractAddress];
}
