import createApolloClient from '@/apollo';
import { config } from '@/components/providers/RainbowKitAllProvider';
import { readContract } from '@wagmi/core';
import { ChainIdParameter } from '@wagmi/core/internal';
import { erc721Abi } from 'viem';
import findNFT from '../graphql/queries/find-nft';
import { updateNFTsOfUserProfile } from '../graphql/mutations/update-user-profile';
import UpdateNFT from '../graphql/mutations/update-nft';
import 'json-bigint-patch';
import findUserProfile from '../graphql/queries/find-user-profile';
function normalizeURI(
	uri: string,
	gateway: string = 'https://ipfs.io/ipfs/',
): string {
	if (uri.startsWith('ipfs://')) {
		return uri.replace('ipfs://', gateway);
	}
	return uri;
}
export async function getNFTMetadata(
	address: `0x${string}`,
	tokenId: number | bigint,
	chainId: ChainIdParameter<typeof config>['chainId'],
) {
	const url = await readContract(config, {
		address,
		abi: erc721Abi,
		functionName: 'tokenURI',
		chainId,
		args: [BigInt(tokenId)],
	});
	const metadata: NFTMetadata = await (await fetch(normalizeURI(url))).json();
	return {
		...metadata,
		image: normalizeURI(metadata.image),
	};
}
export interface NFTMetadata {
	name?: string;
	description?: string;
	image?: string; // Could be URL or IPFS
	attributes?: Array<{
		trait_type: string;
		value: string | number;
		display_type?: string;
	}>;
}
export const NOT_OWNER = 'not owner';
export const ALREADY_IMPORTED = 'already imported';
export async function importNFT(
	importer: `0x${string}`,
	address: `0x${string}`,
	tokenId: number | bigint,
	chainId: ChainIdParameter<typeof config>['chainId'],
) {
	const owner = await readContract(config, {
		address,
		abi: erc721Abi,
		functionName: 'ownerOf',
		chainId,
		args: [BigInt(tokenId)],
	});
	if (owner !== importer) {
		throw new Error(NOT_OWNER);
	}
	const client = createApolloClient();
	const existedNFT = await client.query({
		query: findNFT,
		variables: {
			where: {
				contractAddress: {
					equals: address,
				},
				tokenId: {
					equals: tokenId,
				},
				collection: {
					is: {
						chainId: {
							equals: chainId,
						},
					},
				},
			},
		},
	});
	if (existedNFT.data.findFirstNFT === null) {
		await client.mutate({
			mutation: updateNFTsOfUserProfile,
			refetchQueries: [findUserProfile],
			variables: {
				where: {
					address: importer,
				},
				data: {
					importedNFTs: {
						create: [
							{
								contractAddress: address,
								tokenId,
								collection: {
									connectOrCreate: {
										where: {
											address,
											chainId: {
												equals: chainId,
											},
										},
										create: {
											address,
											chainId,
										},
									},
								},
							},
						],
					},
				},
			},
		});
	} else {
		if (existedNFT.data.findFirstNFT.user.address !== importer) {
			await client.mutate({
				mutation: UpdateNFT,
				variables: {
					where: {
						contractAddress: {
							equals: address,
						},
						tokenId: {
							equals: tokenId,
						},
						collection: {
							is: {
								chainId: {
									equals: chainId,
								},
							},
						},
					},
					data: {
						user: {
							connect: {
								address: importer,
							},
						},
					},
				},
			});
		} else {
			throw new Error(ALREADY_IMPORTED);
		}
	}
}
