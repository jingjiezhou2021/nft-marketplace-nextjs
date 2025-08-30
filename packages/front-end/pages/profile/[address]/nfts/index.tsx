import Layout from '@/components/layout';
import { LoadingMask, LoadingSpinner } from '@/components/loading';
import ProfileHeader from '@/components/profile/header';
import ProfileLayout from '@/components/profile/layout';
import ProfileNav from '@/components/profile/nav';
import ProfileNFTGallery from '@/components/profile/nft-gallery';
import findUserProfile from '@/lib/graphql/queries/find-user-profile';
import { NextPageWithLayout } from '@/pages/_app';
import { useQuery } from '@apollo/client';
import { GetServerSideProps, InferGetStaticPropsType } from 'next';
import { SSRConfig } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { useAccount } from 'wagmi';
export const getServerSideProps: GetServerSideProps<SSRConfig> = async ({
	locale,
}) => {
	return {
		props: {
			...(await serverSideTranslations(locale!, ['common', 'filter'])),
			// Will be passed to the page component as props
		},
	};
};
const Page: NextPageWithLayout = (
	_props: InferGetStaticPropsType<typeof getServerSideProps>,
) => {
	const router = useRouter();
	const { address: userAddress } = useAccount();
	const address = router.query.address as string;
	const searchParams = useSearchParams();
	const { loading, data } = useQuery(findUserProfile, {
		variables: {
			where: {
				address: {
					equals: address,
				},
			},
		},
		fetchPolicy: 'network-only',
		nextFetchPolicy: 'cache-first',
	});
	const filteredNfts = useMemo(() => {
		const status = searchParams.get('nft-status');
		const category = searchParams.get('category');
		const chain = searchParams.get('chain');
		return data?.findFirstUserProfile?.importedNFTs
			.filter((nft) => {
				if (status === 'all' || status === null) {
					return true;
				} else {
					if (status === 'Listed') {
						return nft.activeItem;
					} else {
						return !nft.activeItem;
					}
				}
			})
			.filter((nft) => {
				if (category === 'all' || category === null) {
					return true;
				} else {
					const categories = category.split(',');
					return categories.includes(nft.collection.category);
				}
			})
			.filter((nft) => {
				if (chain === 'all' || chain === null) {
					return true;
				} else {
					const chainIds = chain.split(',');
					return chainIds.includes(nft.collection.chainId.toString());
				}
			});
	}, [data, searchParams]);
	return (
		<div className="relative">
			<LoadingMask
				loading={loading}
				className="flex justify-center items-center"
			>
				<LoadingSpinner size={64} />
			</LoadingMask>
			<ProfileNFTGallery
				nfts={filteredNfts ?? []}
				className="mt-1"
				disableImport={
					userAddress?.toLowerCase() !== address.toLowerCase()
				}
			/>
		</div>
	);
};

Page.GetLayout = ProfileLayout;
export default Page;
