import { graphql } from '@/apollo/gql';
const findOffer = graphql(`
	query FindFirstOffer($where: OfferWhereInput) {
		findFirstOffer(where: $where) {
			buyer
			id
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
		}
	}
`);

export default findOffer;
