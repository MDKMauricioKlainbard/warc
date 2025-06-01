import {useState, useEffect, useMemo} from 'react';
import {Alert, PermissionsAndroid, Platform} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import config from '../../config';


const API_BASE_URL = config.API_URL;

export const useAreaSelector = () => {
  const [userLocation, setUserLocation] = useState([-99.1332, 19.4326]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPoints, setSelectedPoints] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  // Funciones de ubicación
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

  // Funciones de gestión de puntos
  const handleMapPress = feature => {
    try {
      if (selectedPoints.length >= 6) {
        Alert.alert(
          'Límite alcanzado',
          'Solo puedes seleccionar máximo 6 puntos',
        );
        return;
      }

      if (!feature || !feature.geometry || !feature.geometry.coordinates) {
        console.warn('Coordenadas inválidas recibidas');
        return;
      }

      const coordinates = feature.geometry.coordinates;

      // Validar que las coordenadas sean números válidos
      if (
        !Array.isArray(coordinates) ||
        coordinates.length !== 2 ||
        typeof coordinates[0] !== 'number' ||
        typeof coordinates[1] !== 'number' ||
        isNaN(coordinates[0]) ||
        isNaN(coordinates[1])
      ) {
        console.warn('Coordenadas malformadas:', coordinates);
        return;
      }

      const newPoint = {
        id: Date.now().toString(),
        coordinates: coordinates,
        order: selectedPoints.length + 1,
      };

      setSelectedPoints(prev => [...prev, newPoint]);
    } catch (error) {
      console.error('Error al agregar punto:', error);
    }
  };

  const removePoint = pointId => {
    setSelectedPoints(prev => {
      const filtered = prev.filter(point => point.id !== pointId);
      // Reordenar los números después de eliminar
      return filtered.map((point, index) => ({
        ...point,
        order: index + 1,
      }));
    });
  };

  const removeLastPoint = () => {
    if (selectedPoints.length > 0) {
      setSelectedPoints(prev => prev.slice(0, -1));
    }
  };

  const clearAllPoints = () => {
    Alert.alert(
      'Limpiar todos los puntos',
      '¿Estás seguro de que quieres eliminar todos los puntos seleccionados?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Limpiar',
          style: 'destructive',
          onPress: () => setSelectedPoints([]),
        },
      ],
    );
  };

  const handleNext = async onNext => {
    if (selectedPoints.length < 3) {
      Alert.alert(
        'Puntos insuficientes',
        'Necesitas seleccionar al menos 3 puntos para crear un área',
      );
      return;
    }
    const lastPoint = {
      id: Date.now().toString(),
      coordinates: selectedPoints[0].coordinates, // Repetir el primer punto para cerrar el polígono
      order: selectedPoints.length + 1,
    };
    const updatedPoints = [...selectedPoints, lastPoint];
    const resPoints = updatedPoints.map(point => [
      point.coordinates[0],
      point.coordinates[1],
    ]);
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      console.log(
        'Enviando polígono:',
        `${API_BASE_URL}/api/distributed-token/in-polygon`,
        resPoints,
      );

      const response = await axios.post(
        `${API_BASE_URL}/api/distributed-token/in-polygon`,
        {totalPoints: 10, polygonCoordinates: resPoints},
        {
          timeout: 30000, // 30 segundos
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('Respuesta del servidor:', response.data);

      // Llamar onNext con los datos originales y la respuesta del servidor
      onNext && onNext(selectedPoints, response.data);
    } catch (error) {
      console.error('Error al enviar área:', error);

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

      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // GeoJSON para el polígono
  const polygonGeoJSON = useMemo(() => {
    if (selectedPoints.length < 3) return null;

    try {
      const coordinates = selectedPoints.map(point => {
        if (
          !point.coordinates ||
          !Array.isArray(point.coordinates) ||
          point.coordinates.length !== 2 ||
          typeof point.coordinates[0] !== 'number' ||
          typeof point.coordinates[1] !== 'number'
        ) {
          throw new Error('Coordenadas inválidas en punto');
        }
        return point.coordinates;
      });

      // Cerrar el polígono agregando el primer punto al final
      coordinates.push(selectedPoints[0].coordinates);

      return {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [coordinates],
        },
      };
    } catch (error) {
      console.warn('Error creando polígono GeoJSON:', error);
      return null;
    }
  }, [selectedPoints]);

  // GeoJSON para las líneas
  const linesGeoJSON = useMemo(() => {
    if (selectedPoints.length < 2) return null;

    try {
      const coordinates = selectedPoints.map(point => {
        if (
          !point.coordinates ||
          !Array.isArray(point.coordinates) ||
          point.coordinates.length !== 2
        ) {
          throw new Error('Coordenadas inválidas en línea');
        }
        return point.coordinates;
      });

      if (selectedPoints.length >= 3) {
        // Si hay 3 o más puntos, cerrar el polígono
        coordinates.push(selectedPoints[0].coordinates);
      }

      return {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: coordinates,
        },
      };
    } catch (error) {
      console.warn('Error creando líneas GeoJSON:', error);
      return null;
    }
  }, [selectedPoints]);

  // Estados derivados
  const canProceed = selectedPoints.length >= 3;
  const isMapReady =
    !isLoading &&
    userLocation &&
    Array.isArray(userLocation) &&
    userLocation.length === 2;

  return {
    // Estado
    userLocation,
    isLoading,
    selectedPoints,
    canProceed,
    isMapReady,
    polygonGeoJSON,
    linesGeoJSON,
    isSubmitting,
    submitError,

    // Acciones
    handleMapPress,
    removePoint,
    removeLastPoint,
    clearAllPoints,
    handleNext,
    getCurrentLocation,
    clearSubmitError: () => setSubmitError(null),
  };
};
