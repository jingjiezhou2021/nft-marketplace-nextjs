import { graphql } from '@/apollo/gql';
export const userWatchForCollection = graphql(`
	mutation UpdateOneUserProfile(
		$data: UserProfileUpdateInput!
		$where: UserProfileWhereUniqueInput!
	) {
		updateOneUserProfile(data: $data, where: $where) {
			id
			watchedCollections {
				chainId
				address
			}
		}
	}
`);
