import {useState, useEffect, useMemo} from 'react';
import {Alert, PermissionsAndroid, Platform} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import config from '../../config';
const walletAddress = '0xe81189076cdbeb3D77c7d04C451b26eA6c43B4D0';

const API_BASE_URL = config.API_URL;

export const useAreaSelector = () => {
  const [userLocation, setUserLocation] = useState([-99.1332, 19.4326]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPoints, setSelectedPoints] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [showTokenModal, setShowTokenModal] = useState(false); // Nuevo estado
  const [successMessage, setSuccessMessage] = useState(null); // Nuevo estado para éxito

  useEffect(() => {
    requestLocationPermission();
  }, []);

  // Funciones de ubicación (sin cambios)
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
    setUserLocation([-99.1332, 19.4326]);
    setIsLoading(false);
  };

  // Funciones de gestión de puntos (sin cambios)
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

  // Nueva función para abrir el modal
  const openTokenModal = () => {
    if (selectedPoints.length < 3) {
      Alert.alert(
        'Puntos insuficientes',
        'Necesitas seleccionar al menos 3 puntos para crear un área',
      );
      return;
    }
    setShowTokenModal(true);
  };

  // Nueva función para cerrar el modal
  const closeTokenModal = () => {
    setShowTokenModal(false);
  };

  // Nueva función para limpiar mensaje de éxito
  const clearSuccessMessage = () => {
    setSuccessMessage(null);
  };

  // Función actualizada para enviar con cantidad de tokens
  const handleTokenSubmit = async tokenAmount => {
    const lastPoint = {
      id: Date.now().toString(),
      coordinates: selectedPoints[0].coordinates,
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
        {totalPoints: tokenAmount, polygonCoordinates: resPoints},
      );

      const response = await axios.post(
        `${API_BASE_URL}/api/distributed-token/in-polygon`,
        {
          totalPoints: tokenAmount,
          polygonCoordinates: resPoints,
          walletAddress:walletAddress,
        },
        {
          timeout: 30000,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('Respuesta del servidor:', response.data);

      // Cerrar modal
      setShowTokenModal(false);

      // Limpiar puntos seleccionados
      setSelectedPoints([]);

      // Mostrar mensaje de éxito
      setSuccessMessage(
        `¡Éxito! ${tokenAmount} tokens distribuidos correctamente en el área.`,
      );

      // Auto-ocultar mensaje de éxito después de 5 segundos
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);

      return {
        success: true,
        selectedPoints,
        serverResponse: response.data,
      };
    } catch (error) {
      console.error('Error al enviar área:', error);

      let errorMessage = 'Error desconocido';

      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Tiempo de espera agotado. Verifica tu conexión.';
      } else if (error.response) {
        errorMessage = `Error del servidor: ${error.response.status}`;
        if (error.response.data?.message) {
          errorMessage += ` - ${error.response.data.message}`;
        }
      } else if (error.request) {
        errorMessage =
          'Error de conexión. Verifica que el servidor esté disponible.';
      } else {
        errorMessage = error.message || 'Error inesperado';
      }

      setSubmitError(errorMessage);

      // Lanzar error para que sea capturado en el componente principal
      throw new Error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // GeoJSON para el polígono (sin cambios)
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

  // GeoJSON para las líneas (sin cambios)
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
    showTokenModal, // Nuevo estado exportado
    successMessage, // Nuevo estado exportado

    // Acciones
    handleMapPress,
    removePoint,
    removeLastPoint,
    clearAllPoints,
    openTokenModal, // Nueva función
    closeTokenModal, // Nueva función
    handleTokenSubmit, // Nueva función
    clearSuccessMessage, // Nueva función
    getCurrentLocation,
    clearSubmitError: () => setSubmitError(null),
  };
};
