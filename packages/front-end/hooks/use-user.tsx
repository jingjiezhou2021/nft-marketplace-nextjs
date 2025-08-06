import { QueryMode } from '@/apollo/gql/graphql';
import { getAddressAbbreviation } from '@/lib/address';
import findUserProfile from '@/lib/graphql/queries/find-user-profile';
import { useQuery } from '@apollo/client';

export default function useUser(address: string | undefined) {
	const { data, loading } = useQuery(findUserProfile, {
		variables: {
			where: {
				address: {
					equals: address,
					mode: QueryMode.Insensitive,
				},
			},
		},
	});
	const user = data?.findFirstUserProfile;
	let dispName = user?.username;
	if (!dispName) {
		dispName = getAddressAbbreviation(address);
	}
	return {
		user,
		dispName,
		loading,
	};
}
