import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity, Text, Alert, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import HomeScreen from '../screens/home/HomeScreen';
import { logout } from '../utils/auth';
import { useAuth } from '../contexts/AuthContext';

const Tab = createBottomTabNavigator();

const MainNavigator = ({ navigation }) => {
  const { signOut } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          onPress: async () => {
            await logout();
            signOut();
          },
        },
      ]
    );
  };

  const LogoutButton = () => (
    <TouchableOpacity
      onPress={handleLogout}
      style={{ 
        marginRight: 15,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#6B7280',
        borderRadius: 8,
      }}
    >
      <Text style={{ 
        color: '#FFFFFF', 
        fontSize: 14,
        fontWeight: '600'
      }}>
        Salir
      </Text>
    </TouchableOpacity>
  );

  // Componente de icono personalizado para cada pestaña
  const TabIcon = ({ name, focused, label }) => (
    <View style={{
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 4,
    }}>
      <View style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: focused ? '#4F46E5' : '#374151',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
      }}>
        <Icon 
          name={name} 
          size={16} 
          color={focused ? '#FFFFFF' : '#9CA3AF'} 
        />
      </View>
      <Text style={{
        fontSize: 10,
        fontWeight: '500',
        color: focused ? '#4F46E5' : '#9CA3AF',
      }}>
        {label}
      </Text>
    </View>
  );

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB',
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 8,
        },
        headerStyle: {
          backgroundColor: '#FFFFFF',
          borderBottomColor: '#E5E7EB',
          borderBottomWidth: 1,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 4,
        },
        headerTintColor: '#111827',
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 20,
          color: '#111827',
        },
      }}
    >
      <Tab.Screen 
        name="Inicio"
        component={HomeScreen}
        options={{
          title: 'Inicio',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="home" focused={focused} label="Inicio" />
          ),
          headerRight: () => <LogoutButton />,
        }}
      />
      
      <Tab.Screen 
        name="Crear"
        component={HomeScreen} // Reemplazar con el componente correspondiente
        options={{
          title: 'Crear',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="plus" focused={focused} label="Crear" />
          ),
        }}
      />
      
      <Tab.Screen 
        name="Wallet"
        component={HomeScreen} // Reemplazar con el componente correspondiente
        options={{
          title: 'Wallet',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="credit-card" focused={focused} label="Wallet" />
          ),
        }}
      />
      
      <Tab.Screen 
        name="Chat"
        component={HomeScreen} // Reemplazar con el componente correspondiente
        options={{
          title: 'Chat',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="comments" focused={focused} label="Chat" />
          ),
        }}
      />
      
      <Tab.Screen 
        name="Market"
        component={HomeScreen} // Reemplazar con el componente correspondiente
        options={{
          title: 'Market',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="shopping-cart" focused={focused} label="Market" />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;