import {
	EthereumCircleColorful,
	HardhatColorful,
} from '@ant-design/web3-icons';
import { ReactElement } from 'react';
import { hardhat, mainnet, sepolia } from 'viem/chains';

export function getIconOfChain(chain: string | number | bigint) {
	const map = new Map<number, ReactElement>([
		[mainnet.id, <EthereumCircleColorful key="ethereum" />],
		[sepolia.id, <EthereumCircleColorful key="sepolia" />],
		[hardhat.id, <HardhatColorful key="hardhat" />],
	]);
	return map.get(Number(chain));
}

export function getNameOfChain(chainId: string | number | bigint) {
	if (typeof chainId === 'string') {
		chainId = parseInt(chainId);
	}
	chainId = Number(chainId);
	const map = new Map<number, string>([
		[mainnet.id, 'Ethereum'],
		[sepolia.id, 'Sepolia'],
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
		[sepolia.id, 'https://sepolia.etherscan.io/address/'],
	]);
	return map.get(chainId);
}
