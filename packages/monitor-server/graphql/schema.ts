import "reflect-metadata";
import "json-bigint-patch"
import { resolvers } from "@generated/type-graphql";
import { buildSchema } from "type-graphql";
export default async function getSchema() {
  const schema = await buildSchema({
    resolvers,
    validate: false,
  });
  return schema;
}
