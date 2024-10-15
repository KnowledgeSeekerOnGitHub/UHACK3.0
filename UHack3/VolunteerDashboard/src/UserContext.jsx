// src/UserContext.js
import React, { createContext, useContext, useState } from 'react';

// Create a Context for the user
const UserContext = createContext();

// Create a Provider component
export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(null); // State to hold the user ID

  return (
    <UserContext.Provider value={{ userId, setUserId }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the UserContext
export const useUser = () => {
  return useContext(UserContext);
};
