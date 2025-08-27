import { graphql } from '@/apollo/gql';

const findCollection = graphql(`
	query FindFirstCollection($where: CollectionWhereInput) {
		findFirstCollection(where: $where) {
			description
			category
			createdAt
			id
			nickname
			avatar
			url
			banner
			importedNfts {
				contractAddress
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
				collection {
					chainId
				}
				itemBought {
					id
					createdAt
				}
			}
		}
	}
`);

const findCollections = graphql(`
	query Collections($where: CollectionWhereInput) {
		collections(where: $where) {
			description
			category
			createdAt
			address
			chainId
			id
			nickname
			avatar
			url
			banner
			importedNfts {
				contractAddress
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
				collection {
					chainId
				}
				itemTransfered {
					id
					createdAt
				}
				itemBought {
					id
					createdAt
				}
				itemCanceled {
					id
					createdAt
				}
				itemListed {
					id
					createdAt
				}
				offers {
					itemOfferAccepted {
						id
						createdAt
					}
					itemOfferCanceled {
						id
						createdAt
					}
					itemOfferMade {
						id
						createdAt
					}
				}
			}
		}
	}
`);
export default findCollection;
export { findCollections };
