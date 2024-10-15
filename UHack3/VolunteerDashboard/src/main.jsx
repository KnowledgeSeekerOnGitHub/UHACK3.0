// src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client';
import { UserProvider } from './UserContext'; // Import the UserProvider

const client = new ApolloClient({
  uri: 'https://present-shrimp-61.hasura.app/v1/graphql', // replace with your Hasura URL
  headers: {
    'x-hasura-admin-secret': '2CVs2smRVB2mNGp3KcDbIUlEkWig8dphSWooEGM1RHL5ermT2goNDUtGvkQdDjrk', // replace with your Hasura admin secret
  },
  cache: new InMemoryCache(),
});

ReactDOM.render(
  <UserProvider> {/* Wrap your App with UserProvider */}
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </UserProvider>,
  document.getElementById('root')
);
