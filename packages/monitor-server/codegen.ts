import "dotenv/config";
import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: `http://localhost:${process.env.port}/graphql`,
  documents: ["test/**/*.ts"],
  ignoreNoDocuments: true, // for better experience with the watcher
  generates: {
    "./graphql/types/": {
      preset: "client",
    },
    "./graphql/types/schema.graphql": {
      plugins: ["schema-ast"],
      config: {
        includeDirectives: true,
      },
    },
  },
};
export default config;
