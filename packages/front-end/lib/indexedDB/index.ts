export interface CacheRecord<T> {
	key: string;
	value: T;
	expiresAt: number;
}

const DB_NAME = 'NFTMarketPlaceCache';
const DB_VERSION = 3;

const STORES = [
	'metadata',
	'currencyRate',
	'currencyDecimals',
	'balanceOf',
	'allowance',
] as const;
type StoreName = (typeof STORES)[number];

export function openCacheDB(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onupgradeneeded = () => {
			const db = request.result;
			for (const store of STORES) {
				if (!db.objectStoreNames.contains(store)) {
					db.createObjectStore(store, { keyPath: 'key' });
				}
			}
		};

		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}

export async function getCached<T>(
	storeName: StoreName,
	key: string,
): Promise<T | null> {
	const db = await openCacheDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(storeName, 'readwrite');
		const store = tx.objectStore(storeName);
		const request = store.get(key);

		request.onsuccess = () => {
			const result = request.result as CacheRecord<T> | undefined;
			if (!result) return resolve(null);

			if (Date.now() > result.expiresAt) {
				store.delete(key);
				resolve(null);
			} else {
				resolve(result.value);
			}
		};

		request.onerror = () => reject(request.error);
	});
}

export async function setCached<T>(
	storeName: StoreName,
	key: string,
	value: T,
	ttlMs: number,
) {
	const db = await openCacheDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(storeName, 'readwrite');
		const store = tx.objectStore(storeName);

		const record: CacheRecord<T> = {
			key,
			value,
			expiresAt: Date.now() + ttlMs,
		};

		const request = store.put(record);
		request.onsuccess = () => resolve(true);
		request.onerror = () => reject(request.error);
	});
}

export async function withCache<T>(
	storeName: StoreName,
	key: string,
	ttlMs: number,
	fetcher: () => Promise<T>,
): Promise<T> {
	const cached = await getCached<T>(storeName, key);
	if (cached !== null) return cached;
	console.log('cache missed', key);

	const fresh = await fetcher();
	await setCached(storeName, key, fresh, ttlMs);
	return fresh;
}
