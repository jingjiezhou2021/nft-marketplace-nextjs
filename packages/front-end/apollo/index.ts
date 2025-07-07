import { ApolloClient, InMemoryCache } from '@apollo/client';

const createApolloClient = () => {
	return new ApolloClient({
		uri: process.env.APOLLO_SERVER_ENDPOINT,
		cache: new InMemoryCache(),
	});
};

export default createApolloClient;
