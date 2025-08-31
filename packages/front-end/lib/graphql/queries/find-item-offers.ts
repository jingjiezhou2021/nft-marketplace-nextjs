import { graphql } from '@/apollo/gql';

const findItemOfferMades = graphql(`
	query NftMarketplace__ItemOfferMades(
		$where: NftMarketplace__ItemOfferMadeWhereInput
	) {
		nftMarketplace__ItemOfferMades(where: $where) {
			id
			offer {
				buyer
				id
				chainId
				itemOfferAccepted {
					createdAt
					offerId
				}
				itemOfferCanceled {
					createdAt
					offerId
				}
				itemOfferMade {
					createdAt
					offerId
				}
				listing {
					erc20TokenAddress
					erc20TokenName
					price
				}
				nftAddress
				tokenId
				offerId
			}
			seller
			offerId
			createdAt
		}
	}
`);

export default findItemOfferMades;
