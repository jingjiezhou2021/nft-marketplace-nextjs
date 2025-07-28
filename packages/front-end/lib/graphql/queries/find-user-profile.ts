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
			importedNFTs {
				contractAddress
				tokenId
				importedAt
				collection {
					chainId
				}
				activeItem {
					listing {
						price
						erc20TokenAddress
						erc20TokenName
					}
				}
			}
		}
	}
`);
export default findUserProfile;
