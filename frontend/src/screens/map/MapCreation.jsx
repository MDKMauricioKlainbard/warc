import React, {useEffect, useState, useMemo} from 'react';
import {
  View,
  StyleSheet,
  Alert,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Animated,
} from 'react-native';
import Mapbox from '@rnmapbox/maps';
import Geolocation from '@react-native-community/geolocation';
import Icon from 'react-native-vector-icons/FontAwesome';

// Configurar tu token de Mapbox aquí - USAR TOKEN PÚBLICO (pk.)
// Mapbox.setAccessToken('pk.TU_TOKEN_PUBLICO_AQUI');

// Comentando el token para evitar errores - configura tu token público
console.warn('Configurar token público de Mapbox antes de usar');

const AreaSelectorScreen = ({onBack, onNext}) => {
  const [userLocation, setUserLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPoints, setSelectedPoints] = useState([]);
  const [animatedValue] = useState(new Animated.Value(0));

  useEffect(() => {
    requestLocationPermission();
    startPulseAnimation();
  }, []);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

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

  const removeLastPoint = () => {
    if (selectedPoints.length > 0) {
      setSelectedPoints(prev => prev.slice(0, -1));
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

  const handleNext = () => {
    if (selectedPoints.length < 3) {
      Alert.alert(
        'Puntos insuficientes',
        'Necesitas seleccionar al menos 3 puntos para crear un área',
      );
      return;
    }

    // Aquí puedes pasar los puntos seleccionados a la siguiente vista
    onNext && onNext(selectedPoints);
  };

  // Crear el polígono GeoJSON para mostrar el área
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

  // Crear las líneas GeoJSON para mostrar las conexiones
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

  if (
    isLoading ||
    !userLocation ||
    !Array.isArray(userLocation) ||
    userLocation.length !== 2
  ) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Cargando mapa...</Text>
      </View>
    );
  }

  const canProceed = selectedPoints.length >= 3;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Icon name="arrow-left" size={16} color="#6B7280" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Seleccionar Área</Text>

        <TouchableOpacity style={styles.clearButton} onPress={clearAllPoints}>
          <Icon name="trash" size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* Instrucciones */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          Selecciona mínimo 3 puntos para crear un área
        </Text>
        <Text style={styles.pointsCounter}>
          {selectedPoints.length}/6 puntos seleccionados
        </Text>
      </View>

      {/* Mapa */}
      <View style={styles.mapContainer}>
        <Mapbox.MapView
          style={styles.map}
          zoomEnabled={true}
          scrollEnabled={true}
          pitchEnabled={false}
          rotateEnabled={true}
          styleURL="mapbox://styles/mapbox/light-v10"
          onPress={handleMapPress}>
          <Mapbox.Camera
            centerCoordinate={userLocation}
            zoomLevel={16}
            animationMode="flyTo"
            animationDuration={2000}
          />

          {/* Marcador de ubicación del usuario */}
          <Mapbox.PointAnnotation id="userLocation" coordinate={userLocation}>
            <Animated.View
              style={[
                styles.userMarker,
                {
                  transform: [
                    {
                      scale: animatedValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.3],
                      }),
                    },
                  ],
                },
              ]}>
              <View style={styles.userMarkerInner} />
            </Animated.View>
          </Mapbox.PointAnnotation>

          {/* Marcadores de puntos seleccionados */}
          {selectedPoints.map(point => (
            <Mapbox.PointAnnotation
              key={point.id}
              id={point.id}
              coordinate={point.coordinates}
              onSelected={() => {
                Alert.alert(
                  'Eliminar punto',
                  `¿Quieres eliminar el punto ${point.order}?`,
                  [
                    {
                      text: 'Cancelar',
                      style: 'cancel',
                    },
                    {
                      text: 'Eliminar',
                      style: 'destructive',
                      onPress: () => removePoint(point.id),
                    },
                  ],
                );
              }}>
              <View style={styles.selectedPointMarker}>
                <Text style={styles.pointNumber}>{point.order}</Text>
                <View style={styles.deleteIndicator}>
                  <Icon name="times" size={8} color="#FFFFFF" />
                </View>
              </View>
            </Mapbox.PointAnnotation>
          ))}

          {/* Líneas del polígono */}
          {linesGeoJSON && (
            <Mapbox.ShapeSource id="lines" shape={linesGeoJSON}>
              <Mapbox.LineLayer
                id="lineLayer"
                style={{
                  lineColor: '#4F46E5',
                  lineWidth: 3,
                  lineOpacity: 0.8,
                }}
              />
            </Mapbox.ShapeSource>
          )}

          {/* Área sombreada del polígono */}
          {polygonGeoJSON && (
            <Mapbox.ShapeSource id="polygon" shape={polygonGeoJSON}>
              <Mapbox.FillLayer
                id="fillLayer"
                style={{
                  fillColor: '#4F46E5',
                  fillOpacity: 0.2,
                }}
              />
            </Mapbox.ShapeSource>
          )}
        </Mapbox.MapView>

        {/* Controles flotantes */}
        <View style={styles.mapControls}>
          <TouchableOpacity
            style={styles.mapControlButton}
            onPress={() => {
              // Recentrar en la ubicación del usuario
              getCurrentLocation();
            }}>
            <Icon name="crosshairs" size={16} color="#6B7280" />
          </TouchableOpacity>

          {selectedPoints.length > 0 && (
            <TouchableOpacity
              style={[styles.mapControlButton, styles.undoButton]}
              onPress={removeLastPoint}>
              <Icon name="undo" size={16} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Panel inferior */}
      <View style={styles.bottomPanel}>
        {selectedPoints.length > 0 && (
          <View style={styles.selectedPointsList}>
            <Text style={styles.selectedPointsTitle}>
              Puntos seleccionados:
            </Text>
            <View style={styles.pointsRow}>
              {selectedPoints.map((point, index) => (
                <TouchableOpacity
                  key={point.id}
                  style={styles.pointChip}
                  onPress={() => {
                    Alert.alert(
                      'Eliminar punto',
                      `¿Quieres eliminar el punto ${point.order}?`,
                      [
                        {
                          text: 'Cancelar',
                          style: 'cancel',
                        },
                        {
                          text: 'Eliminar',
                          style: 'destructive',
                          onPress: () => removePoint(point.id),
                        },
                      ],
                    );
                  }}>
                  <Text style={styles.pointChipText}>{index + 1}</Text>
                  <View style={styles.chipDeleteIcon}>
                    <Icon name="times" size={8} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.pointsHint}>Toca un punto para eliminarlo</Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.nextButton,
            {backgroundColor: canProceed ? '#4F46E5' : '#D1D5DB'},
          ]}
          onPress={handleNext}
          disabled={!canProceed}>
          <Text
            style={[
              styles.nextButtonText,
              {color: canProceed ? '#FFFFFF' : '#9CA3AF'},
            ]}>
            Siguiente {canProceed && `(${selectedPoints.length} puntos)`}
          </Text>
          <Icon
            name="arrow-right"
            size={16}
            color={canProceed ? '#FFFFFF' : '#9CA3AF'}
            style={{marginLeft: 8}}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 16,
    marginTop: 20,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 50 : 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  clearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionsContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  instructionsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  pointsCounter: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  userMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  userMarkerInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
  },
  selectedPointMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4F46E5',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    position: 'relative',
  },
  pointNumber: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  deleteIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  mapControls: {
    position: 'absolute',
    top: 20,
    right: 16,
    gap: 8,
  },
  mapControlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  undoButton: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  bottomPanel: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  selectedPointsList: {
    marginBottom: 16,
  },
  selectedPointsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  pointsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pointChip: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#4F46E5',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  pointChipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  chipDeleteIcon: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  pointsHint: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#4F46E5',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default AreaSelectorScreen;
