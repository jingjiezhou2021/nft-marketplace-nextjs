import { config } from '@/components/providers/RainbowKitAllProvider';
import { readContract } from '@wagmi/core';
import { ChainIdParameter } from '@wagmi/core/internal';
import { useEffect, useState } from 'react';
import { erc721Abi } from 'viem';

export default function useNFTOwner(
	address: `0x${string}`,
	chainId: ChainIdParameter<typeof config>['chainId'],
	tokenId: number,
): string {
	const [ownerAddr, setOwnerAddr] = useState('');
	useEffect(() => {
		readContract(config, {
			address,
			abi: erc721Abi,
			functionName: 'ownerOf',
			chainId,
			args: [BigInt(tokenId)],
		}).then((res) => {
			setOwnerAddr(res);
		});
	}, [address, chainId, tokenId]);
	return ownerAddr;
}
