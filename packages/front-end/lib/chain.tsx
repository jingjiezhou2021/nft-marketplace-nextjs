import {
	BaseCircleColorful,
	EthereumCircleColorful,
	HardhatColorful,
} from '@ant-design/web3-icons';
import { ReactElement } from 'react';
import { baseSepolia, hardhat, mainnet, sepolia } from 'viem/chains';

export function getIconOfChain(chain: string | number | bigint | undefined) {
	const map = new Map<number, ReactElement>([
		[mainnet.id, <EthereumCircleColorful key="ethereum" />],
		[sepolia.id, <EthereumCircleColorful key="sepolia" />],
		[hardhat.id, <HardhatColorful key="hardhat" />],
		[baseSepolia.id, <BaseCircleColorful key="base-sepolia" />],
	]);
	return map.get(Number(chain));
}

export function getNameOfChain(chainId: string | number | bigint | undefined) {
	if (typeof chainId === 'string') {
		chainId = parseInt(chainId);
	}
	chainId = Number(chainId);
	const map = new Map<number, string>([
		[mainnet.id, 'Ethereum'],
		[sepolia.id, 'Sepolia'],
		[baseSepolia.id, 'Base Sepolia'],
		[hardhat.id, 'Hardhat'],
	]);
	return map.get(chainId);
}

export function getExplorerOfChain(chainId: string | number | bigint) {
	if (typeof chainId === 'string') {
		chainId = parseInt(chainId);
	}
	chainId = Number(chainId);
	const map = new Map<number, string>([
		[mainnet.id, 'https://etherscan.io/address/'],
		[baseSepolia.id, 'https://sepolia.basescan.org/address/'],
		[sepolia.id, 'https://sepolia.etherscan.io/address/'],
	]);
	return map.get(chainId);
}
