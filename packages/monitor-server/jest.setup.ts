// jest.setup.ts
import "dotenv/config";
import "json-bigint-patch";
import getApolloClientForTest from "./test/utils/apollo-client";
import { graphql } from "./graphql/types/gql";
// import { afterEach } from '@jest/globals';

async function clear() {
  await getApolloClientForTest().mutate({
    mutation: graphql(`
      mutation clear(
        $where: ActiveItemWhereInput
        $deleteManyNftMarketplaceItemBoughtWhere2: NftMarketplace__ItemBoughtWhereInput
        $deleteManyNftMarketplaceItemCanceledWhere2: NftMarketplace__ItemCanceledWhereInput
        $deleteManyNftMarketplaceItemListedWhere2: NftMarketplace__ItemListedWhereInput
        $deleteManyNftMarketplaceItemOfferMadeWhere2: NftMarketplace__ItemOfferMadeWhereInput
        $deleteManyNftMarketplaceItemOfferAcceptedWhere2: NftMarketplace__ItemOfferAcceptedWhereInput
        $deleteManyNftMarketplace__ItemOfferCanceledWhere2: NftMarketplace__ItemOfferCanceledWhereInput
      ) {
        deleteManyNftMarketplace__ItemListed(
          where: $deleteManyNftMarketplaceItemListedWhere2
        ) {
          count
        }
        deleteManyNftMarketplace__ItemOfferMade(
          where: $deleteManyNftMarketplaceItemOfferMadeWhere2
        ) {
          count
        }
        deleteManyNftMarketplace__ItemCanceled(
          where: $deleteManyNftMarketplaceItemCanceledWhere2
        ) {
          count
        }
        deleteManyNftMarketplace__ItemOfferCanceled(
          where: $deleteManyNftMarketplace__ItemOfferCanceledWhere2
        ) {
          count
        }
        deleteManyNftMarketplace__ItemOfferAccepted(
          where: $deleteManyNftMarketplaceItemOfferAcceptedWhere2
        ) {
          count
        }
        deleteManyNftMarketplace__ItemBought(
          where: $deleteManyNftMarketplaceItemBoughtWhere2
        ) {
          count
        }
        deleteManyActiveItem(where: $where) {
          count
        }
      }
    `),
    variables: {
      where: {
        chainId: {
          equals: 31337,
        },
      },
      deleteManyNftMarketplaceItemBoughtWhere2: {
        chainId: {
          equals: 31337,
        },
      },
      deleteManyNftMarketplaceItemCanceledWhere2: {
        chainId: {
          equals: 31337,
        },
      },
      deleteManyNftMarketplaceItemListedWhere2: {
        chainId: {
          equals: 31337,
        },
      },
      deleteManyNftMarketplaceItemOfferMadeWhere2: {
        chainId: {
          equals: 31337,
        },
      },
      deleteManyNftMarketplace__ItemOfferCanceledWhere2: {
        chainId: {
          equals: 31337,
        },
      },
      deleteManyNftMarketplaceItemOfferAcceptedWhere2: {
        chainId: {
          equals: 31337,
        },
      },
    },
  });
}
afterEach(async () => {
  await clear();
});
