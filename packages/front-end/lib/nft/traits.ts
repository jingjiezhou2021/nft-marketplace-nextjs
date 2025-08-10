import { NFTMetadata } from '.';

export default function getTraitValuesMap(metadataArr: NFTMetadata[]) {
	const map = new Map<string, Map<string | number, number>>();
	metadataArr.forEach((m) => {
		m.attributes?.forEach((a) => {
			let key = '';
			let value: string | number = '';
			if (a.trait_type) {
				key = a.trait_type.toString();
				value = a.value;
			} else {
				key = Object.keys(a)[0];
				value = Object.values(a)[0];
			}
			const vals = map.get(key);
			if (vals) {
				const oldCount = vals?.get(value);
				vals?.set(value, oldCount ?? 0 + 1);
			} else {
				map.set(key, new Map([[value, 1]]));
			}
		});
	});
	return map;
}
