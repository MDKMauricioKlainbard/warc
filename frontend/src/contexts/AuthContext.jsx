// contexts/AuthContext.js
import React, {createContext, useContext, useState, useEffect} from 'react';
import {isAuthenticated, logout, getUser} from '../utils/auth';

const AuthContext = createContext({});

export const AuthProvider = ({children}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authenticated = await isAuthenticated();
      setIsLoggedIn(authenticated);

      if (authenticated) {
        const userData = await getUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error verificando estado de autenticación:', error);
      setIsLoggedIn(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async () => {
    try {
      const userData = await getUser();
      setUser(userData);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Error en signIn:', error);
    }
  };

  const signOut = async () => {
    try {
      await logout();
      setIsLoggedIn(false);
      setUser(null);
    } catch (error) {
      console.error('Error en signOut:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isLoading,
        user,
        signIn,
        signOut,
        checkAuthStatus,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
