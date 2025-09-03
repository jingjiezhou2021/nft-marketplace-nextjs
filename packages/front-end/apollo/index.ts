import {
	ApolloClient,
	ApolloLink,
	InMemoryCache,
	NormalizedCacheObject,
} from '@apollo/client';
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs';
let apolloClient: ApolloClient<NormalizedCacheObject>;
const createApolloClient = () => {
	if (apolloClient) {
		return apolloClient;
	} else {
		apolloClient = new ApolloClient({
			link: new ApolloLink((operation, forward) => {
				return forward(operation).map((response) => {
					const dfs = (data) => {
						if (data && typeof data === 'object') {
							for (const key of Object.keys(data)) {
								if (key === 'price') {
									const n = Number(data[key]);
									data[key] = BigInt(
										n.toLocaleString('fullwide', {
											useGrouping: false,
										}),
									);
								}
								dfs(data[key]);
							}
						}
					};
					dfs(response.data);
					return response;
				});
			}).concat(
				createUploadLink({
					uri: process.env.NEXT_PUBLIC_APOLLO_SERVER_ENDPOINT,
					headers: {
						'apollo-require-preflight': 'true',
					},
				}),
			),
			cache: new InMemoryCache(),
			defaultOptions: {
				query: {
					fetchPolicy: 'network-only',
				},
				watchQuery: {
					fetchPolicy: 'network-only',
					nextFetchPolicy: 'cache-first',
				},
			},
		});
		return apolloClient;
	}
};

export default createApolloClient;
