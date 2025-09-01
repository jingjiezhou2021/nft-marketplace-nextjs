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
	return (
		<ProfileNFTGallery
			address={address as `0x${string}`}
			className="mt-1"
			disableImport={userAddress?.toLowerCase() !== address.toLowerCase()}
		/>
	);
};

Page.GetLayout = ProfileLayout;
export default Page;
