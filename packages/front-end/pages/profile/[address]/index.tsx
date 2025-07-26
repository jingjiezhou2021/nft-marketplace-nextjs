import { InferGetStaticPropsType } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import findUserProfile from '@/lib/graphql/queries/find-user-profile';
import ProfileHeader from '@/components/profile/header';
import ProfileNav from '@/components/profile/nav';
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
					<ProfileNav address={address} />
				</div>
			)}
		</>
	);
}
