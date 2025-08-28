import { useQuery } from '@apollo/client';
import { CollectionDetailProps } from '../nft/collection';
import { CarouselDoubleRowScrollerItem } from './carousel-double-row-items-scroller';
import CarouselDoubleRowScoller from './carousel-double-row-scroller';
import findCollection from '@/lib/graphql/queries/find-collection';
import { QueryMode } from '@/apollo/gql/graphql';
import useCollectionName from '@/lib/hooks/use-collection-name';
import useCollectionSaleInfo from '@/lib/hooks/use-collection-sale-info';
import CryptoPrice from '../crypto-price';
import EmojiAvatar from '../emojo-avatar';
import { chunkArray } from '@/lib/utils';
export function CarouselTrendingCollectionItem({
	collection,
}: {
	collection: CollectionDetailProps;
}) {
	const { data: collectionData, loading: collectionDataLoading } = useQuery(
		findCollection,
		{
			variables: {
				where: {
					address: {
						equals: collection.address,
						mode: QueryMode.Insensitive,
					},
					chainId: {
						equals: collection.chainId,
					},
				},
			},
		},
	);
	const { name: collectionName, loading: collectionNameLoading } =
		useCollectionName(collection.address, collection.chainId);
	const { floorSaleListing, loading: saleInfoLoading } =
		useCollectionSaleInfo(collection.address, collection.chainId);
	return (
		<CarouselDoubleRowScrollerItem
			link={`/nft/${collection.chainId}/${collection.address}`}
			loading={
				collectionDataLoading ||
				collectionNameLoading ||
				saleInfoLoading
			}
			twin={{
				cover: collectionData?.findFirstCollection?.avatar ? (
					new URL(
						collectionData?.findFirstCollection?.avatar,
						process.env.NEXT_PUBLIC_SERVER_ENDPOINT,
					).toString()
				) : (
					<EmojiAvatar
						address={collection.address}
						className="size-[80px] rounded-xl"
						size={36}
					/>
				),
				title: collectionName,
				description: floorSaleListing ? (
					<CryptoPrice {...floorSaleListing} />
				) : (
					'-'
				),
			}}
		/>
	);
}
export default function CarouselTrendingCollections({
	collections,
}: {
	collections: CollectionDetailProps[];
}) {
	const twins = chunkArray(collections, 2);
	return (
		<CarouselDoubleRowScoller
			twins={twins.map((t) => {
				return [
					<CarouselTrendingCollectionItem
						collection={t[0]}
						key={t[0].address}
					/>,
					<CarouselTrendingCollectionItem
						collection={t[1]}
						key={t[1].address}
					/>,
				];
			})}
		/>
	);
}
