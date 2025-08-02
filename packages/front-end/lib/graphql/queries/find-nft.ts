import { graphql } from '@/apollo/gql';

const findNFT = graphql(`
	query findNFT($where: NFTWhereInput!) {
		findFirstNFT(where: $where) {
			user {
				address
				username
				id
			}
			importedAt
			userId
			collection {
				description
			}
		}
	}
`);
export default findNFT;
