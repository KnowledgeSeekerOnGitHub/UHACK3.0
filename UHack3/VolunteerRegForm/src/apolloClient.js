import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

// Replace with your Hasura GraphQL endpoint and admin key
const HASURA_GRAPHQL_ENDPOINT = 'https://present-shrimp-61.hasura.app/v1/graphql';
const HASURA_ADMIN_SECRET = '2CVs2smRVB2mNGp3KcDbIUlEkWig8dphSWooEGM1RHL5ermT2goNDUtGvkQdDjrk';

const client = new ApolloClient({
    link: new HttpLink({
    uri: HASURA_GRAPHQL_ENDPOINT,
    headers: {
        'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
    },
  }),
  cache: new InMemoryCache(),
});

export default client;
