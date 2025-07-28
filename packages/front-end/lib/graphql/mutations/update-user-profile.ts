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

export const updateNFTsOfUserProfile = graphql(`
	mutation UpdateNFTsOfUserProfile(
		$data: UserProfileUpdateInput!
		$where: UserProfileWhereUniqueInput!
	) {
		updateOneUserProfile(data: $data, where: $where) {
			importedNFTs {
				contractAddress
				tokenId
				importedAt
				collection {
					address
					chainId
				}
			}
		}
	}
`);

export default updateProfileGQL;
