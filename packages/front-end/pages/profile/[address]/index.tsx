import { InferGetStaticPropsType } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import findUserProfile from '@/lib/graphql/queries/find-user-profile';
import ProfileHeader from '@/components/profile/header';
import ProfileNav from '@/components/profile/nav';
import NFTGallery from '@/components/nft-gallery';
import { useEffect, useState } from 'react';
import { getNFTMetadata, NFTMetadata } from '@/lib/nft';
import { NFTCardData } from '@/components/nft-card';
export const getServerSideProps = async ({ locale }) => {
	return {
		props: {
			...(await serverSideTranslations(locale, ['common'])),
			// Will be passed to the page component as props
		},
	};
};
export default function Page(
	_props: InferGetStaticPropsType<typeof getServerSideProps>,
) {
	const router = useRouter();
	const address = router.query.address as string;
	const { loading, data } = useQuery(findUserProfile, {
		variables: {
			where: {
				address: {
					equals: address,
				},
			},
		},
	});
	const [nftMetadata, setNftMetadata] = useState<NFTCardData[]>([]);
	useEffect(() => {
		if (!loading && data.findFirstUserProfile?.importedNFTs) {
			Promise.all(
				data.findFirstUserProfile?.importedNFTs.map((nft) => {
					return getNFTMetadata(
						nft.contractAddress as `0x${string}`,
						nft.tokenId,
						nft.collection.chainId,
					).then((metadata) => {
						return {
							...metadata,
							name: metadata.name ?? `#${nft.tokenId}`,
							listing: nft.activeItem?.listing,
							chainId: nft.collection.chainId,
						};
					});
				}),
			).then((metadataArr) => {
				setNftMetadata(
					metadataArr.map((metadata) => {
						return {
							imageUrl: metadata.image,
							name: metadata.name,
							listing: metadata.listing,
							chainId: metadata.chainId,
						};
					}),
				);
			});
		}
	}, [loading, data?.findFirstUserProfile?.importedNFTs]);
	return (
		<>
			{!loading && (
				<div className="flex flex-col relative min-h-0 w-full min-w-0">
					<ProfileHeader
						data={data}
						address={address}
					/>
					<ProfileNav
						address={address}
						className="sticky top-0 z-10 w-full max-w-full"
					/>
					<NFTGallery
						nfts={nftMetadata}
						className="mt-1"
					/>
				</div>
			)}
		</>
	);
}
