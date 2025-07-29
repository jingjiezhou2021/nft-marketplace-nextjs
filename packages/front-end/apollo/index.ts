import {
	ApolloClient,
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
			link: createUploadLink({
				uri: process.env.NEXT_PUBLIC_APOLLO_SERVER_ENDPOINT,
				headers: {
					'apollo-require-preflight': 'true',
				},
			}),
			cache: new InMemoryCache(),
		});
		return apolloClient;
	}
};

export default createApolloClient;
