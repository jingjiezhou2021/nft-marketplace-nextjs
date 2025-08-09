import { NFTMetadata } from '.';

export default function getTraitValuesMap(metadataArr: NFTMetadata[]) {
	const map = new Map<string, Map<string | number, number>>();
	metadataArr.forEach((m) => {
		m.attributes?.forEach((a) => {
			const vals = map.get(a.trait_type);
			if (vals) {
				const oldCount = vals?.get(a.value);
				vals?.set(a.value, oldCount ?? 0 + 1);
			} else {
				map.set(a.trait_type, new Map([[a.value, 1]]));
			}
		});
	});
	return map;
}
