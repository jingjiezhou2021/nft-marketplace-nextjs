import { graphql } from '@/apollo/gql';

const findCollection = graphql(`
	query FindFirstCollection($where: CollectionWhereInput) {
		findFirstCollection(where: $where) {
			description
			category
			createdAt
			id
			importedNfts {
				activeItemId
				activeItem {
					chainId
					id
					listing {
						erc20TokenAddress
						erc20TokenName
						price
					}
					seller
					tokenId
				}
				importedAt
				tokenId
				user {
					address
					avatar
					username
				}
			}
		}
	}
`);
export default findCollection;
