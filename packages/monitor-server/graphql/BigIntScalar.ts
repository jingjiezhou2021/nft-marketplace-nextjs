import { GraphQLScalarType, Kind } from "graphql";
export default new GraphQLScalarType<bigint | null, string | null>({
  name: "BigInt",
  description: "BigInt scalar represented as string",
  serialize(value) {
    return (value as bigint).toString();
  },
  parseValue(value) {
    if (value === null) {
      return null;
    } else {
      return BigInt(value as string);
    }
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return BigInt(ast.value);
    }
    return null;
  },
});
