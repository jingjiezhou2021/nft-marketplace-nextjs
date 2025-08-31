import { ReactNode } from 'react';
import ProfileHeader from './header';
import ProfileNav from './nav';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import findUserProfile from '@/lib/graphql/queries/find-user-profile';
import { LoadingMask, LoadingSpinner } from '../loading';
import Layout from '../layout';

export default function ProfileLayout({ children }: { children?: ReactNode }) {
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
		fetchPolicy: 'network-only',
		nextFetchPolicy: 'cache-first',
	});
	return (
		<Layout>
			<div className="flex flex-col relative min-h-0 w-full min-w-0">
				<LoadingMask
					loading={loading}
					className="flex justify-center items-center"
				>
					<LoadingSpinner />
				</LoadingMask>
				<ProfileHeader
					data={data}
					address={address}
				/>
				<ProfileNav
					address={address}
					className="sticky top-0 z-20 w-full max-w-full"
				/>
				{children}
			</div>
		</Layout>
	);
}
