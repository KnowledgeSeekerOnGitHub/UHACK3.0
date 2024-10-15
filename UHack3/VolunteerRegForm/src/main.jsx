import React from 'react';
import ReactDOM from 'react-dom/client'; // Use React 18's new root API
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import App from './App';
// import './index.css'; // Ensure you have this CSS file for styles

// Create an Apollo Client instance
const client = new ApolloClient({
  uri: 'https://present-shrimp-61.hasura.app/v1/graphql', // Replace with your actual Hasura GraphQL endpoint
  headers: {
    'x-hasura-admin-secret': '2CVs2smRVB2mNGp3KcDbIUlEkWig8dphSWooEGM1RHL5ermT2goNDUtGvkQdDjrk' // Replace with your Hasura admin secret
  },
  cache: new InMemoryCache(),
});

// Rendering the App component within the ApolloProvider
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);