import { cn } from '@/lib/utils';
import BlurryBackground from './blurry-background';
import Image from 'next/image';
import { CollectionDetailProps } from './nft/collection';
import { useQuery } from '@apollo/client';
import findCollection from '@/lib/graphql/queries/find-collection';
import { QueryMode } from '@/apollo/gql/graphql';
import EmojiAvatar from './emojo-avatar';
import useCollectionName from '@/lib/hooks/use-collection-name';
import { useTranslation } from 'next-i18next';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import NFTCard from './nft-card';
import Link from 'next/link';
import { LoadingMask, LoadingSpinner } from './loading';
export default function HighlyWeekSales({
	address,
	chainId,
	...props
}: CollectionDetailProps & React.ComponentProps<'div'>) {
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
	const { t, i18n } = useTranslation('common');
	const weekSaleCount = useMemo(() => {
		return data?.findFirstCollection?.importedNfts.reduce((prev, cur) => {
			return (
				prev +
				cur.itemBought.filter((ib) => {
					const now = new Date();
					const past7Days = new Date();
					past7Days.setDate(now.getDate() - 7);
					return new Date(ib.createdAt) >= past7Days;
				}).length
			);
		}, 0);
	}, [data]);
	return (
		<BlurryBackground
			bg={
				data?.findFirstCollection?.banner ? (
					<Image
						src={new URL(
							data.findFirstCollection.banner,
							process.env.NEXT_PUBLIC_SERVER_ENDPOINT,
						).toString()}
						fill
						alt="blurred-bg"
					></Image>
				) : (
					<EmojiAvatar
						address={address}
						className="size-full absolute left-0 top-0"
						size={128}
					/>
				)
			}
			{...props}
			className={cn('cursor-pointer', props.className)}
		>
			<LoadingMask
				loading={loading || collectionNameLoading}
				className="flex justify-center items-center top-0 left-0"
			>
				<LoadingSpinner size={48} />
			</LoadingMask>
			<Link
				href={`/nft/${chainId}/${address}`}
				locale={i18n.language}
				className="w-full flex flex-col md:grid md:grid-cols-2 md:gap-6 dark relative"
			>
				<div className="grid grid-cols-2 gap-4 md:block text-wrap w-full md:w-auto md:col-span-1">
					<div className="mb-8">
						{data?.findFirstCollection?.avatar ? (
							<Image
								src={new URL(
									data.findFirstCollection.avatar,
									process.env.NEXT_PUBLIC_SERVER_ENDPOINT,
								).toString()}
								width={92}
								height={92}
								alt="avatar"
								className="mb-6 rounded-xl"
							/>
						) : (
							<EmojiAvatar
								address={address}
								className="size-24 rounded-xl"
								size={32}
							/>
						)}
						<h3 className="text-xl pb-4 font-bold">
							{collectionName}
						</h3>
						<div className="text-sm font-light font-mono">
							{t('7d sales')}:&nbsp;
							{weekSaleCount?.toLocaleString()}
						</div>
					</div>
					<div className="text-xs font-extralight">
						<div className="leading-[1.7] line-clamp-7 md:line-clamp-4">
							{data?.findFirstCollection?.description
								?.split('\\n')
								.map((paragraph) => {
									return (
										<>
											<p key={paragraph}>{paragraph}</p>
											<br />
										</>
									);
								})}
						</div>
					</div>
				</div>
				<div className="mt-8 md:mt-0 md:col-span-1 flex items-center md:justify-end">
					<div className="grid grid-cols-2 gap-4">
						{data?.findFirstCollection?.importedNfts
							.slice(0, 2)
							.map((nft) => {
								return (
									<NFTCard
										nft={nft}
										key={nft.tokenId}
									/>
								);
							})}
					</div>
				</div>
			</Link>
		</BlurryBackground>
	);
}
