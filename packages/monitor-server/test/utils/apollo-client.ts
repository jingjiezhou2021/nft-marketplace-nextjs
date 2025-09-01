import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from "@apollo/client";

export default function getApolloClientForTest() {
  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: new ApolloLink((operation, forward) => {
      return forward(operation).map((response) => {
        const dfs = (data) => {
          if (data && typeof data === "object") {
            for (const key of Object.keys(data)) {
              if (typeof data[key] === "number" || key === "price") {
                const n = Number(data[key]);
                data[key] = BigInt(
                  n.toLocaleString("fullwide", {
                    useGrouping: false,
                  })
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
      new HttpLink({ uri: `http://localhost:${process.env.port}/graphql` })
    ),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: "no-cache",
      },
      query: {
        fetchPolicy: "no-cache",
      },
      mutate: {
        fetchPolicy: "no-cache",
      },
    },
  });
  return client;
}
