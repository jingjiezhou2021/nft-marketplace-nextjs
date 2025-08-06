export type NFTDetailProps = {
	contractAddress: `0x${string}`;
	tokenId: number;
	chainId: ChainIdParameter<typeof config>['chainId'];
};
