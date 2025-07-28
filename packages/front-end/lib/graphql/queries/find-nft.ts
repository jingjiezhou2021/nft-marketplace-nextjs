import { graphql } from '@/apollo/gql';

const findNFT = graphql(`
	query findNFT($where: NFTWhereInput!) {
		findFirstNFT(where: $where) {
			user {
				address
				id
			}
			importedAt
			userId
		}
	}
`);
export default findNFT;
