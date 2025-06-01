import {useState, useEffect, useCallback} from 'react';
import {Alert, PermissionsAndroid, Platform} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import config from '../../config';

const API_BASE_URL = config.API_URL;

export const useDistributionPoints = () => {
  const [userLocation, setUserLocation] = useState([-99.1332, 19.4326]);
  const [isLoading, setIsLoading] = useState(true);
  const [distributionPoints, setDistributionPoints] = useState([]);
  const [isLoadingPoints, setIsLoadingPoints] = useState(false);
  const [pointsError, setPointsError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    // Obtener puntos de distribución cuando la ubicación esté lista
    if (!isLoading && userLocation) {
      fetchDistributionPoints();
    }
  }, [isLoading, userLocation]);

  // Funciones de ubicación (similares a UseAreaSelector)
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Permiso de Ubicación',
            message:
              'Esta app necesita acceso a tu ubicación para mostrar el mapa',
            buttonNeutral: 'Preguntar después',
            buttonNegative: 'Cancelar',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentLocation();
        } else {
          setDefaultLocation();
        }
      } catch (err) {
        console.warn(err);
        setDefaultLocation();
      }
    } else {
      getCurrentLocation();
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        setUserLocation([position.coords.longitude, position.coords.latitude]);
        setIsLoading(false);
      },
      error => {
        console.log('Error obteniendo ubicación:', error);
        Alert.alert('Error', 'No se pudo obtener la ubicación');
        setDefaultLocation();
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  const setDefaultLocation = () => {
    // Ubicación por defecto (México DF)
    setUserLocation([-99.1332, 19.4326]);
    setIsLoading(false);
  };

  // Función principal para obtener puntos de distribución
  const fetchDistributionPoints = useCallback(async () => {
    setIsLoadingPoints(true);
    setPointsError(null);

    try {
      console.log(
        'Obteniendo puntos de distribución desde:',
        `${API_BASE_URL}/api/distributed-token/get-distribution-points`,
      );

      const response = await axios.get(
        `${API_BASE_URL}/api/distributed-token/get-distribution-points`,
        {
          timeout: 15000, // 15 segundos
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('Puntos de distribución obtenidos:', response.data);

      // Validar y procesar los datos
      if (Array.isArray(response.data)) {
        const validPoints = response.data
          .filter(point => {
            // Validar estructura del punto
            return (
              point &&
              point._id &&
              point.coordinates &&
              Array.isArray(point.coordinates) &&
              point.coordinates.length === 2 &&
              typeof point.coordinates[0] === 'number' &&
              typeof point.coordinates[1] === 'number' &&
              !isNaN(point.coordinates[0]) &&
              !isNaN(point.coordinates[1]) &&
              typeof point.quantity === 'number'
            );
          })
          .map(point => ({
            id: point._id,
            coordinates: point.coordinates,
            quantity: point.quantity,
            createdAt: point.createdAt,
            updatedAt: point.updatedAt,
          }));

        setDistributionPoints(validPoints);
        setLastFetchTime(new Date());

        console.log(`${validPoints.length} puntos válidos procesados`);
      } else {
        throw new Error('Formato de respuesta inválido');
      }
    } catch (error) {
      console.error('Error al obtener puntos de distribución:', error);

      let errorMessage = 'Error desconocido';

      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Tiempo de espera agotado. Verifica tu conexión.';
      } else if (error.response) {
        // Error del servidor (4xx, 5xx)
        errorMessage = `Error del servidor: ${error.response.status}`;
        if (error.response.data?.message) {
          errorMessage += ` - ${error.response.data.message}`;
        }
      } else if (error.request) {
        // Error de red
        errorMessage =
          'Error de conexión. Verifica que el servidor esté disponible.';
      } else {
        errorMessage = error.message || 'Error inesperado';
      }

      setPointsError(errorMessage);

      // Mostrar alerta solo si no hay puntos cargados previamente
      if (distributionPoints.length === 0) {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setIsLoadingPoints(false);
    }
  }, [API_BASE_URL, distributionPoints.length]);

  // Función para refrescar puntos manualmente
  const refreshDistributionPoints = () => {
    fetchDistributionPoints();
  };

  // Función para obtener puntos cercanos al usuario
  const getNearbyPoints = useCallback(
    (radiusInKm = 1) => {
      if (!userLocation || distributionPoints.length === 0) {
        return [];
      }

      const [userLng, userLat] = userLocation;

      return distributionPoints.filter(point => {
        const [pointLng, pointLat] = point.coordinates;
        const distance = calculateDistance(
          userLat,
          userLng,
          pointLat,
          pointLng,
        );
        return distance <= radiusInKm;
      });
    },
    [userLocation, distributionPoints],
  );

  // Función auxiliar para calcular distancia entre dos puntos (fórmula de Haversine)
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = deg2rad(lat2 - lat1);
    const dLng = deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  const deg2rad = deg => {
    return deg * (Math.PI / 180);
  };

  // Función para obtener la distancia y dirección desde el usuario hasta un punto
  const getPointDistanceInfo = useCallback(
    point => {
      if (!userLocation || !point.coordinates) {
        return {distance: 0, direction: '', distanceText: ''};
      }

      const [userLng, userLat] = userLocation;
      const [pointLng, pointLat] = point.coordinates;

      const distance = calculateDistance(userLat, userLng, pointLat, pointLng);
      const bearing = calculateBearing(userLat, userLng, pointLat, pointLng);
      const direction = getDirectionFromBearing(bearing);

      let distanceText;
      if (distance < 1) {
        distanceText = `${Math.round(distance * 1000)} m`;
      } else {
        distanceText = `${distance.toFixed(1)} km`;
      }

      return {
        distance,
        direction,
        distanceText: `${distanceText} al ${direction}`,
      };
    },
    [userLocation],
  );

  // Función auxiliar para calcular el rumbo entre dos puntos
  const calculateBearing = (lat1, lng1, lat2, lng2) => {
    const dLng = deg2rad(lng2 - lng1);
    const lat1Rad = deg2rad(lat1);
    const lat2Rad = deg2rad(lat2);

    const y = Math.sin(dLng) * Math.cos(lat2Rad);
    const x =
      Math.cos(lat1Rad) * Math.sin(lat2Rad) -
      Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);

    let bearing = Math.atan2(y, x);
    bearing = (bearing * 180) / Math.PI;
    bearing = (bearing + 360) % 360;

    return bearing;
  };

  // Función auxiliar para convertir grados a direcciones cardinales
  const getDirectionFromBearing = bearing => {
    const directions = [
      'norte',
      'noreste',
      'este',
      'sureste',
      'sur',
      'suroeste',
      'oeste',
      'noroeste',
    ];
    const index = Math.round(bearing / 45) % 8;
    return directions[index];
  };

  // Estados derivados
  const isMapReady =
    !isLoading &&
    userLocation &&
    Array.isArray(userLocation) &&
    userLocation.length === 2;

  const hasPoints = distributionPoints.length > 0;

  return {
    // Estado principal
    userLocation,
    isLoading,
    isMapReady,

    // Estado de puntos de distribución
    distributionPoints,
    isLoadingPoints,
    pointsError,
    hasPoints,
    lastFetchTime,

    // Acciones
    refreshDistributionPoints,
    getCurrentLocation,
    clearPointsError: () => setPointsError(null),

    // Funciones auxiliares
    getNearbyPoints,
    getPointDistanceInfo,
    calculateDistance,
  };
};
