import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

const Stack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1A1A1A',
        },
        headerTintColor: '#E91E63',
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 20,
        },
        headerBackTitleVisible: false,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen 
        name="Login"
        component={LoginScreen}
        options={{ 
          title: 'Iniciar Sesión',
          headerShown: false // Ocultar header para pantalla de login
        }}
      />
      <Stack.Screen 
        name="Register"
        component={RegisterScreen}
        options={{ 
          title: 'Crear Cuenta',
          headerShown: false // Ocultar header para pantalla de registro
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;