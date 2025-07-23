import { graphql } from '@/apollo/gql';

const findUserProfile = graphql(`
	query FindFirstUserProfile($where: UserProfileWhereInput) {
		findFirstUserProfile(where: $where) {
			address
			avatar
			banner
			bio
			url
			username
		}
	}
`);
export default findUserProfile;
