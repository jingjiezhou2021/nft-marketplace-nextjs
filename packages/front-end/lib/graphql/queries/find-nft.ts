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
const findNFTs = graphql(`
	query NFTS($where: NFTWhereInput) {
		nFTS(where: $where) {
			user {
				address
				username
				id
				avatar
			}
			importedAt
			userId
			contractAddress
			tokenId
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
			offers {
				buyer
				chainId
				offerId
				listing {
					erc20TokenAddress
					erc20TokenName
					price
				}
				itemOfferMade {
					createdAt
					id
				}
				itemOfferCanceled {
					createdAt
					id
				}
				itemOfferAccepted {
					createdAt
					id
				}
			}
		}
	}
`);
export { findNFTs };
