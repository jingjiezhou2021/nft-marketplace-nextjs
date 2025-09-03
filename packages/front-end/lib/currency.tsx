import { Listing } from '@/apollo/gql/graphql';
import { config } from '@/components/providers/RainbowKitAllProvider';
import { EthereumCircleColorful, USDTColorful } from '@ant-design/web3-icons';
import { readContract } from '@wagmi/core';
import { ChainIdParameter } from '@wagmi/core/internal';
import { ReactNode } from 'react';
import { ierc2362Abi } from 'smart-contract/wagmi/generated';
import { bytesToHex, erc20Abi, formatUnits, hexToBytes } from 'viem';
import { baseSepolia, hardhat, sepolia } from 'viem/chains';
import { PRICEFEED_DECIMALS } from './hooks/use-currency-rate';
import { withCache } from './indexedDB';

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
	return await withCache(
		'currencyDecimals',
		`${chainId}-${address}`,
		5 * 60 * 1000,
		async () => {
			const res = await readContract(config, {
				address,
				chainId,
				abi: erc20Abi,
				functionName: 'decimals',
			});
			return res;
		},
	);
}
export async function getCurrencyRate({
	erc20TokenAddress,
	chainId,
}: Pick<Listing, 'erc20TokenAddress'> & {
	chainId: ChainIdParameter<typeof config>['chainId'];
}) {
	if (chainId === undefined) {
		chainId = sepolia.id;
	}
	return await withCache(
		'currencyRate',
		`${chainId}-${erc20TokenAddress}`,
		2 * 60 * 1000,
		async () => {
			const priceFeedAddress = CHAIN_PRICEFEED_ADDRESSES[chainId];
			const priceFeedId = CHAIN_PRICEFEED_ID[chainId][erc20TokenAddress];
			const paddedPriceFeedId = bytesToHex(
				hexToBytes(priceFeedId, { size: 32 }),
			);
			const data = await readContract(config, {
				abi: ierc2362Abi,
				functionName: 'valueFor',
				address: priceFeedAddress as `0x${string}`,
				chainId,
				args: [paddedPriceFeedId],
			});
			return {
				data: data[0],
				decimals: PRICEFEED_DECIMALS,
			};
		},
	);
}
export async function getUSDPrice({
	erc20TokenAddress,
	price,
	chainId,
}: Pick<Listing, 'erc20TokenAddress' | 'price'> & {
	chainId: ChainIdParameter<typeof config>['chainId'];
}) {
	if (chainId === undefined) {
		chainId = sepolia.id;
	}
	const { data, decimals } = await getCurrencyRate({
		erc20TokenAddress,
		chainId,
	});
	const currencyDecimals = await getCurrencyDecimals(
		erc20TokenAddress as `0x${string}`,
		chainId,
	);
	if (data !== 0n) {
		return parseFloat(
			formatUnits(price * data, currencyDecimals + decimals),
		);
	} else {
		return parseFloat(formatUnits(price, currencyDecimals));
	}
}

export async function maxOrMinListingInUSD(
	listings: (Pick<
		Listing,
		'erc20TokenAddress' | 'price' | 'erc20TokenName'
	> & {
		chainId: ChainIdParameter<typeof config>['chainId'];
	})[],
	max: boolean = true,
) {
	if (listings.length === 0) {
		return null;
	}
	const ret = await Promise.all(
		listings.map((listing) => {
			return getUSDPrice({
				erc20TokenAddress: listing.erc20TokenAddress,
				chainId: listing.chainId,
				price: listing.price,
			});
		}),
	).then((usdPrices) => {
		let targetIdx = 0;
		usdPrices.forEach((usdPrice, index) => {
			if (max) {
				if (usdPrice > usdPrices[targetIdx]) {
					targetIdx = index;
				}
			} else {
				if (usdPrice < usdPrices[targetIdx]) {
					targetIdx = index;
				}
			}
		});
		return { ...listings[targetIdx], usdPrice: usdPrices[targetIdx] };
	});
	return ret;
}

export async function maxListingInUSD(
	listings: (Pick<
		Listing,
		'erc20TokenAddress' | 'price' | 'erc20TokenName'
	> & {
		chainId: ChainIdParameter<typeof config>['chainId'];
	})[],
) {
	return maxOrMinListingInUSD(listings);
}

export async function minListingInUSD(
	listings: (Pick<
		Listing,
		'erc20TokenAddress' | 'price' | 'erc20TokenName'
	> & {
		chainId: ChainIdParameter<typeof config>['chainId'];
	})[],
) {
	return maxOrMinListingInUSD(listings, false);
}
export async function getTotalValueInUSD(
	listings: (Pick<
		Listing,
		'erc20TokenAddress' | 'price' | 'erc20TokenName'
	> & {
		chainId: ChainIdParameter<typeof config>['chainId'];
	})[],
) {
	const ret = await Promise.all(
		listings.map((listing) => {
			return getUSDPrice({
				erc20TokenAddress: listing.erc20TokenAddress,
				chainId: listing.chainId,
				price: listing.price,
			});
		}),
	).then((usdPrices) => {
		return usdPrices.reduce((prev, cur) => {
			return prev + cur;
		}, 0);
	});
	return ret;
}
