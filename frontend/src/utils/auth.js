// utils/auth.js
import AsyncStorage from '@react-native-async-storage/async-storage';

import config from '../../config';

const API_BASE_URL = config.API_URL;// Ajusta según tu configuración

// Función para realizar login
export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // Guardar el token y datos del usuario en AsyncStorage
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      return true;
    } else {
      console.error('Error en login:', data.message);
      return false;
    }
  } catch (error) {
    console.error('Error de red en login:', error);
    return false;
  }
};

// Función para realizar registro
export const register = async (name, lastname, email, password) => {
  try {
    const walletAddress = '0xe81189076cdbeb3D77c7d04C451b26eA6c43B4D0'; // Hardcodeado como solicitaste

    const response = await fetch(`${API_BASE_URL}/api/user/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        lastname,
        email,
        password,
        walletAddress,
      }),
    });

    if (response.ok) {
      return true;
    } else {
      const errorData = await response.json();
      console.error('Error en registro:', errorData.message);
      return false;
    }
  } catch (error) {
    console.error('Error de red en registro:', error);
    return false;
  }
};

// Función para verificar si el usuario está autenticado
export const isAuthenticated = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    return token !== null;
  } catch (error) {
    console.error('Error verificando autenticación:', error);
    return false;
  }
};

// Función para obtener el token guardado
export const getToken = async () => {
  try {
    return await AsyncStorage.getItem('token');
  } catch (error) {
    console.error('Error obteniendo token:', error);
    return null;
  }
};

// Función para obtener los datos del usuario guardados
export const getUser = async () => {
  try {
    const userString = await AsyncStorage.getItem('user');
    return userString ? JSON.parse(userString) : null;
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    return null;
  }
};

// Función para cerrar sesión
export const logout = async () => {
  try {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    return true;
  } catch (error) {
    console.error('Error en logout:', error);
    return false;
  }
};
