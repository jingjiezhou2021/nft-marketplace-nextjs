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
