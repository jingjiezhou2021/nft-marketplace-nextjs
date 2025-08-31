import { graphql } from '@/apollo/gql';

const findListing = graphql(`
	query FindFirstNftMarketplace__ItemListed(
		$where: NftMarketplace__ItemListedWhereInput
	) {
		findFirstNftMarketplace__ItemListed(where: $where) {
			activeItem {
				id
			}
			chainId
			createdAt
			itemBought {
				id
			}
			itemCanceled {
				id
			}
			listing {
				erc20TokenAddress
				erc20TokenName
				price
			}
			nftAddress
			tokenId
			seller
		}
	}
`);
export default findListing;
