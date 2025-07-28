import { graphql } from '@/apollo/gql';

const UpdateNFT = graphql(`
	mutation UpdateOneNFT(
		$data: NFTUpdateInput!
		$where: NFTWhereUniqueInput!
	) {
		updateOneNFT(data: $data, where: $where) {
			contractAddress
			tokenId
			importedAt
			userId
			user {
				address
			}
			collection {
				id
				address
				createdAt
				chainId
			}
			activeItem {
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
export default UpdateNFT;
