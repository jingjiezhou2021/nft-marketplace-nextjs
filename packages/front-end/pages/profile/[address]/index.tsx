import { InferGetStaticPropsType } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import findUserProfile from '@/lib/graphql/queries/find-user-profile';
import ProfileHeader from '@/components/profile/header';
import ProfileNav from '@/components/profile/nav';
import NFTGallery from '@/components/nft-gallery';
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
						nfts={new Array(25).fill({
							imageUrl: '/example7.avif',
							name: '#6759',
							price: '1.86',
						})}
						className="mt-1"
					/>
				</div>
			)}
		</>
	);
}
