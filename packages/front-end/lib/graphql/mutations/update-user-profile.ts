import { graphql } from '@/apollo/gql';

const updateProfileGQL = graphql(`
	mutation updateProfile($newUserProfileData: UserProfileInputData!) {
		updateUserAvatar(NewUserProfileData: $newUserProfileData) {
			id
			address
			username
			bio
			url
			avatar
			banner
		}
	}
`);

export default updateProfileGQL;
