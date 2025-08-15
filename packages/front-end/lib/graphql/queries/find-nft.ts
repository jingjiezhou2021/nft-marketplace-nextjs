import { graphql } from '@/apollo/gql';

const findNFT = graphql(`
	query findNFT($where: NFTWhereInput!) {
		findFirstNFT(where: $where) {
			user {
				address
				username
				id
				avatar
			}
			importedAt
			userId
			collection {
				description
			}
			activeItem {
				id
				seller
				nftAddress
				tokenId
				listing {
					price
					erc20TokenAddress
					erc20TokenName
				}
				chainId
			}
		}
	}
`);
export default findNFT;
