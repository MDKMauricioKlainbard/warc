// utils/auth.js
let isUserLoggedIn = false;

export const login = async (username, password) => {
  // Simulación de login sin almacenamiento local
  if (username === 'test' && password === '123') {
    isUserLoggedIn = true;
    return true;
  }
  return false;
};

export const register = async (username, password) => {
  // Simulación de registro sin almacenamiento local
  if (username && password) {
    return true;
  }
  return false;
};

export const logout = async () => {
  isUserLoggedIn = false;
  return true;
};

export const isAuthenticated = async () => {
  return isUserLoggedIn;
};