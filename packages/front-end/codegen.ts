import 'dotenv/config';
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
	schema: process.env.NEXT_PUBLIC_APOLLO_SERVER_ENDPOINT,
	documents: ['pages/**/*.tsx'],
	ignoreNoDocuments: true, // for better experience with the watcher
	generates: {
		'./apollo/gql/': {
			preset: 'client',
		},
		'./apollo/gql/schema.graphql': {
			plugins: ['schema-ast'],
			config: {
				includeDirectives: true,
			},
		},
	},
};
export default config;
