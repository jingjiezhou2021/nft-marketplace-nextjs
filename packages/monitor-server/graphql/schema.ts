import "reflect-metadata";
import "json-bigint-patch";
import { resolvers } from "@generated/type-graphql";
import { buildSchema } from "type-graphql";
import { CustomUserProfileResolver } from "./custom/resolvers/custom-user-profile";
import { CustomCollectionResolver } from "./custom/resolvers/custom-collection-info";
export default async function getSchema() {
  const schema = await buildSchema({
    resolvers: [
      ...resolvers,
      CustomUserProfileResolver,
      CustomCollectionResolver,
    ],
    validate: false,
  });
  return schema;
}
