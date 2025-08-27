import useCollectionSaleInfo from '@/lib/hooks/use-collection-sale-info';
import { CollectionDetailProps } from '../nft/collection';
import { CarouselImageScrollerItem } from './carousel-image-scroller';
import CarouselScroller from './carousel-scroller';
import { useQuery } from '@apollo/client';
import findCollection from '@/lib/graphql/queries/find-collection';
import { QueryMode } from '@/apollo/gql/graphql';
import useCollectionName from '@/lib/hooks/use-collection-name';
import { useTranslation } from 'next-i18next';
import CryptoPrice from '../crypto-price';
import EmojiAvatar from '../emojo-avatar';
export function CarouselCollectionItem({
	address,
	chainId,
	inZone,
	shadow,
}: CollectionDetailProps & { inZone: boolean; shadow?: boolean }) {
	const { t } = useTranslation('common');
	const { floorSaleListing, loading: saleInfoLoading } =
		useCollectionSaleInfo(address, chainId);
	const { data, loading } = useQuery(findCollection, {
		variables: {
			where: {
				address: {
					equals: address,
					mode: QueryMode.Insensitive,
				},
				chainId: {
					equals: chainId,
				},
			},
		},
	});
	const { name: collectionName, loading: collectionNameLoading } =
		useCollectionName(address, chainId);
	return (
		<CarouselImageScrollerItem
			link={`/nft/${chainId}/${address}`}
			inZone={inZone}
			shadow={shadow}
			loading={saleInfoLoading || loading || collectionNameLoading}
			content={{
				image: data?.findFirstCollection?.banner ? (
					new URL(
						data?.findFirstCollection?.banner,
						process.env.NEXT_PUBLIC_SERVER_ENDPOINT,
					).toString()
				) : (
					<EmojiAvatar
						address={address}
						className="size-full absolute left-0 top-0"
						size={64}
					/>
				),
				title: collectionName,
				subtitle: (
					<div className="flex items-center">
						{t('Floor price')}: &nbsp;
						{floorSaleListing ? (
							<CryptoPrice {...floorSaleListing} />
						) : (
							'-'
						)}
					</div>
				),
			}}
		/>
	);
}
export default function CarouselCollections({
	collections,
}: {
	collections: CollectionDetailProps[];
}) {
	return (
		<CarouselScroller
			loop
			contents={collections.map((c) => {
				return {
					render(inZone) {
						return (
							<CarouselCollectionItem
								{...c}
								inZone={inZone}
								shadow
							/>
						);
					},
				};
			})}
		/>
	);
}
