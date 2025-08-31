import { graphql } from '@/apollo/gql';

const findItemListeds = graphql(`
	query NftMarketplace__ItemListeds(
		$where: NftMarketplace__ItemListedWhereInput
	) {
		nftMarketplace__ItemListeds(where: $where) {
			id
			chainId
			createdAt
			itemBought {
				id
				createdAt
			}
			listing {
				erc20TokenAddress
				erc20TokenName
				price
			}
			nft {
				contractAddress
				collection {
					chainId
				}
				tokenId
				activeItem {
					itemListedId
				}
			}
			seller
		}
	}
`);

export default findItemListeds;
