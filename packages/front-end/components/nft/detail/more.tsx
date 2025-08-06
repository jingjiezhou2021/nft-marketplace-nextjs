import { useQuery } from '@apollo/client';
import { NFTDetailProps } from '.';
import findCollection from '@/lib/graphql/queries/find-collection';
import { LoadingMask, LoadingSpinner } from '@/components/loading';
import NFTCard from '@/components/nft-card';
import { useEffect } from 'react';

export default function NFTDetailMore({
	contractAddress,
	tokenId,
	chainId,
}: NFTDetailProps) {
	const { data, loading, refetch } = useQuery(findCollection, {
		variables: {
			where: {
				address: {
					equals: contractAddress,
				},
				chainId: {
					equals: chainId,
				},
			},
		},
		notifyOnNetworkStatusChange: true,
	});
	useEffect(() => {
		refetch();
	}, [tokenId, refetch]);
	useEffect(() => {
		console.log('more loading', loading);
	}, [loading]);
	return (
		<div className="relative">
			{loading && (
				<LoadingMask
					className="top-0 flex justify-center items-center"
					loading={loading}
				>
					<LoadingSpinner size={48}></LoadingSpinner>
				</LoadingMask>
			)}
			<div className="grid grid-cols-2 gap-4">
				{data?.findFirstCollection?.importedNfts
					.filter((n) => n.tokenId !== tokenId)
					.slice(0, 4)
					.map((n) => {
						return (
							<NFTCard
								key={n.tokenId}
								nft={n}
								className="min-h-32"
								fontSmaller
							/>
						);
					})}
			</div>
		</div>
	);
}
