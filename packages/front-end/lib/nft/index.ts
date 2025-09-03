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
import { CollectionsQuery, QueryMode } from '@/apollo/gql/graphql';
import { ValuesType } from 'utility-types';
import { getFromCache, saveToCache } from '../indexedDB/metadata';
function normalizeURI(
	uri: string,
	gateway: string = 'https://ipfs.io/ipfs/',
): string {
	if (uri.startsWith('ipfs://')) {
		return uri.replace('ipfs://', gateway);
	} else {
		return `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}api/proxy/?url=${uri}`;
	}
}
export async function getNFTCollectionCreatorAddress(
	address: `0x${string}`,
	chainId: ChainIdParameter<typeof config>['chainId'],
): Promise<string | undefined> {
	try {
		const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_KEY;
		const creation = await (
			await fetch(
				`https://api.etherscan.io/v2/api?chainid=${chainId}&module=contract&action=getcontractcreation&contractaddresses=${address}&apikey=${apiKey}`,
			)
		).json();
		return creation.result[0].contractCreator;
	} catch (err) {
		return undefined;
	}
}
export async function getNFTCollectionName(
	address: `0x${string}`,
	chainId: ChainIdParameter<typeof config>['chainId'],
): Promise<string | undefined> {
	try {
		const collectionName = await readContract(config, {
			address,
			abi: erc721Abi,
			functionName: 'name',
			chainId,
			args: [],
		});
		return collectionName;
	} catch (err) {
		return undefined;
	}
}
export async function getNFTMetadata(
	address: `0x${string}`,
	tokenId: number | bigint,
	chainId: ChainIdParameter<typeof config>['chainId'],
) {
	const cacheKey = `${address}-${tokenId}-${chainId}`;
	const ttlMs = 10 * 60 * 1000; // 10 minutes

	// Try cache first
	const cached = await getFromCache(cacheKey);
	if (cached) {
		return {
			...cached,
			image: normalizeURI(cached.image ?? ''),
			dispName: cached.name ?? `# ${tokenId}`,
		};
	}
	const url = await readContract(config, {
		address,
		abi: erc721Abi,
		functionName: 'tokenURI',
		chainId,
		args: [BigInt(tokenId)],
	});
	const metadata: NFTMetadata = await (await fetch(normalizeURI(url))).json();
	await saveToCache(cacheKey, metadata, ttlMs);
	const dispName = metadata.name ?? `# ${tokenId}`;
	return {
		...metadata,
		image: normalizeURI(metadata.image ?? ''),
		dispName,
	};
}
export interface NFTMetadata {
	name?: string;
	description?: string;
	image?: string; // Could be URL or IPFS
	attributes?:
		| Array<{
				trait_type: string;
				value: string | number;
				display_type?: string;
		  }>
		| Array<Record<string, string | number>>;
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
					mode: QueryMode.Insensitive,
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
		fetchPolicy: 'network-only',
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
		if (
			existedNFT.data.findFirstNFT?.user.address.toLowerCase() !==
			importer.toLowerCase()
		) {
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
export function getAllEventsOfNfts(
	nfts: ValuesType<CollectionsQuery['collections']>['importedNfts'],
) {
	return nfts.reduce(
		(prev, cur) => {
			return prev.concat([
				...cur.itemBought,
				...cur.itemCanceled,
				...cur.itemListed,
				...cur.itemTransfered,
				...cur.offers.reduce(
					(prev, cur) => {
						const tmp: {
							createdAt: any;
							_typename?: string;
						}[] = [];
						if (cur.itemOfferMade) {
							tmp.push(cur.itemOfferMade);
						}
						if (cur.itemOfferAccepted) {
							tmp.push(cur.itemOfferAccepted);
						}
						if (cur.itemOfferCanceled) {
							tmp.push(cur.itemOfferCanceled);
						}
						return [...prev, ...tmp];
					},
					[] as { createdAt: any; __typename?: string }[],
				),
			]);
		},
		[] as { createdAt: any; __typename?: string }[],
	);
}
export function getOwnersOfNfts(
	nfts: ValuesType<CollectionsQuery['collections']>['importedNfts'],
) {
	return Array.from(
		new Set(
			nfts.reduce((prev, cur) => {
				return prev.concat(cur.user.address);
			}, [] as string[]),
		),
	);
}
