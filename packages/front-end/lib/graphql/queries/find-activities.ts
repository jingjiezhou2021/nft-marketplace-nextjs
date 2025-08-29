import { graphql } from '@/apollo/gql';

const findActivities = graphql(`
	query Activities {
		nftMarketplace__ItemBoughts {
			buyer
			chainId
			createdAt
			seller
			listing {
				erc20TokenAddress
				erc20TokenName
				price
			}
			nft {
				contractAddress
				tokenId
				user {
					address
					id
				}
				collection {
					avatar
					chainId
				}
			}
		}
		nftMarketplace__ItemCanceleds {
			createdAt
			chainId
			listing {
				erc20TokenAddress
				erc20TokenName
				price
			}
			seller
			nft {
				contractAddress
				tokenId
				collection {
					avatar
					chainId
				}
			}
		}
		nftMarketplace__ItemListeds {
			chainId
			createdAt
			listing {
				erc20TokenAddress
				erc20TokenName
				price
			}
			seller
			nft {
				contractAddress
				tokenId
				collection {
					avatar
					chainId
				}
			}
		}
		nftMarketplace__ItemOfferMades {
			chainId
			createdAt
			seller
			offer {
				listing {
					erc20TokenAddress
					erc20TokenName
					price
				}
				buyer
				nft {
					contractAddress
					tokenId
					user {
						address
						id
					}
					collection {
						avatar
						chainId
					}
				}
			}
		}
		nftMarketplace__ItemTransfereds {
			createdAt
			chainId
			receiver
			sender
			nft {
				contractAddress
				tokenId
				collection {
					avatar
					chainId
				}
			}
		}
	}
`);

export default findActivities;
