import 'dotenv/config';
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
	schema: process.env.APOLLO_SERVER_ENDPOINT,
	documents: ['pages/**/*.tsx'],
	generates: {
		'./apollo/gql/': {
			preset: 'client',
		},
	},
};
export default config;
