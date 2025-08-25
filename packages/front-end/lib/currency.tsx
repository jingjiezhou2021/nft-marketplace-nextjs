import { config } from '@/components/providers/RainbowKitAllProvider';
import { EthereumCircleColorful, USDTColorful } from '@ant-design/web3-icons';
import { readContract } from '@wagmi/core';
import { ChainIdParameter } from '@wagmi/core/internal';
import { ReactNode } from 'react';
import { erc20Abi } from 'viem';
import { baseSepolia, hardhat, sepolia } from 'viem/chains';

export enum Currency {
	USD,
	ETH,
}
export const SEPOLIA_AAVE_USDT = '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0';
export const SEPOLIA_AAVE_WETH = '0xC558DBdd856501FCd9aaF1E62eae57A9F0629a3c';

export const BASE_SEPOLIA_USDT = '0xfB28B76Cb34B42Bd02E94De7B204B06dCF905cf3';
export const BASE_SEPOLIA_WETH = '0x4B43f657EF9cc53afA0f66D9D908b5e9F7Db7ce1';

export const BASE_SEPOLIA_PRICEFEED =
	'0x1111AbA2164AcdC6D291b08DfB374280035E1111';

export const SEPOLIA_PRICEFEED = '0x1111AbA2164AcdC6D291b08DfB374280035E1111';

export const CHAIN_CURRENCY_ADDRESS = {
	[sepolia.id]: {
		WETH: SEPOLIA_AAVE_WETH,
		USDT: SEPOLIA_AAVE_USDT,
	},
	[baseSepolia.id]: {
		WETH: BASE_SEPOLIA_WETH,
		USDT: BASE_SEPOLIA_USDT,
	},
};

export const CHAIN_PRICEFEED_ADDRESSES = {
	[baseSepolia.id]: BASE_SEPOLIA_PRICEFEED,
	[sepolia.id]: SEPOLIA_PRICEFEED,
};
export const CHAIN_PRICEFEED_ID = {
	[sepolia.id]: {
		[SEPOLIA_AAVE_WETH]: '0x3d15f701',
		[SEPOLIA_AAVE_USDT]: '0x00000000',
	},
	[baseSepolia.id]: {
		[BASE_SEPOLIA_WETH]: '0x3d15f701',
		[BASE_SEPOLIA_USDT]: '0x538f5a25',
	},
};
export function getCryptoIcon(
	chainId: string | bigint | number,
	tokenContractAddress: string,
) {
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
		[baseSepolia.id]: {
			[BASE_SEPOLIA_USDT]: (
				<>
					<USDTColorful />
				</>
			),
			[BASE_SEPOLIA_WETH]: (
				<>
					<EthereumCircleColorful />
				</>
			),
		},
	};
	return map[Number(chainId)][tokenContractAddress];
}
export function getCryptoName(chainId: number, tokenContractAddress: string) {
	const map: Record<number, Record<string, string>> = {
		[sepolia.id]: {
			[SEPOLIA_AAVE_USDT]: 'USDT',
			[SEPOLIA_AAVE_WETH]: 'WETH',
		},
		[baseSepolia.id]: {
			[BASE_SEPOLIA_USDT]: 'USDT',
			[BASE_SEPOLIA_WETH]: 'WETH',
		},
	};
	return map[chainId][tokenContractAddress];
}
export async function getCurrencyDecimals(
	address: `0x${string}`,
	chainId: ChainIdParameter<typeof config>['chainId'],
) {
	const res = await readContract(config, {
		address,
		chainId,
		abi: erc20Abi,
		functionName: 'decimals',
	});
	return res;
}
