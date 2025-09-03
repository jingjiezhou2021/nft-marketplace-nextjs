import { NFTMetadata } from '../../nft';

interface CachedNFTMetadata {
	key: string; // unique key = `${address}-${tokenId}-${chainId}`
	metadata: NFTMetadata;
	expiresAt: number; // Date.now() + 10 minutes
}

const DB_NAME = 'NFTMetadataCache';
const STORE_NAME = 'metadata';
const DB_VERSION = 1;

export function openCacheDB(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onupgradeneeded = () => {
			const db = request.result;
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				db.createObjectStore(STORE_NAME, { keyPath: 'key' });
			}
		};

		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}
export async function getFromCache(key: string): Promise<NFTMetadata | null> {
	const db = await openCacheDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, 'readwrite');
		const store = tx.objectStore(STORE_NAME);
		const request = store.get(key);

		request.onsuccess = () => {
			const result = request.result as CachedNFTMetadata | undefined;
			if (!result) return resolve(null);

			if (Date.now() > result.expiresAt) {
				store.delete(key); // cleanup expired
				resolve(null);
			} else {
				resolve(result.metadata);
			}
		};
		request.onerror = () => reject(request.error);
	});
}

export async function saveToCache(
	key: string,
	metadata: NFTMetadata,
	ttlMs: number,
) {
	const db = await openCacheDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, 'readwrite');
		const store = tx.objectStore(STORE_NAME);

		const record: CachedNFTMetadata = {
			key,
			metadata,
			expiresAt: Date.now() + ttlMs,
		};

		const request = store.put(record);
		request.onsuccess = () => resolve(true);
		request.onerror = () => reject(request.error);
	});
}
