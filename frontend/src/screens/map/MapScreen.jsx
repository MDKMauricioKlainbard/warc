import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  StyleSheet,
  Alert,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  FlatList,
  Dimensions,
  PanResponder,
} from 'react-native';
import Mapbox from '@rnmapbox/maps';
import Geolocation from '@react-native-community/geolocation';
import TokenMarker from '../../components/map/TokenMarker';
import Icon from 'react-native-vector-icons/FontAwesome';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import TokenItem from '../../components/map/TokenItem';
import {useDistributionPoints} from '../../hooks/UseDistributionPoints'; // Importar el nuevo hook

// Configurar tu token de Mapbox aquí
Mapbox.setAccessToken(
  'sk.eyJ1IjoiZ2FsdTc3NzciLCJhIjoiY21iYjl5OTc0MGZobDJycHh5Y2JrZ3poNCJ9.qbuqOJvDIL8G9ZuKOswYdA',
);

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

// Definir los puntos de ajuste como porcentajes de la altura de la pantalla
const SNAP_POINTS = {
  MINIMIZED: 0.15, // 15%
  MEDIUM: 0.45, // 45%
  MAXIMIZED: 0.80, // 85%
};

const MapScreen = ({onBack}) => {
  const [currentSnapPoint, setCurrentSnapPoint] = useState('MINIMIZED');

  // Usar el nuevo hook para obtener puntos de distribución
  const {
    userLocation,
    isLoading,
    isMapReady,
    distributionPoints,
    isLoadingPoints,
    pointsError,
    hasPoints,
    refreshDistributionPoints,
    getPointDistanceInfo,
    getNearbyPoints,
  } = useDistributionPoints();

  // Animated value para la posición del bottom sheet
  const translateY = useSharedValue(SCREEN_HEIGHT * (1 - SNAP_POINTS.MINIMIZED));

  // Convertir puntos de distribución al formato esperado por TokenItem
  const tokensData = React.useMemo(() => {
    if (!hasPoints || !userLocation) return [];

    return distributionPoints.map((point, index) => {
      const distanceInfo = getPointDistanceInfo(point);

      return {
        id: point.id,
        name: `Token #${index + 1}`,
        distance: distanceInfo.distanceText,
        icon: point.quantity >= 5 ? '🏆' : point.quantity >= 3 ? '💎' : '📦',
        color: '#07415C',
        status:
          distanceInfo.distance < 0.05
            ? 'En rango'
            : distanceInfo.distance < 0.5
            ? 'Caminar'
            : 'Zona AR',
        statusColor:
          distanceInfo.distance < 0.05
            ? '#E50B7B'
            : distanceInfo.distance < 0.5
            ? '#9CA3AF'
            : '#06B6D4',
        coordinates: point.coordinates,
        quantity: point.quantity,
      };
    });
  }, [distributionPoints, userLocation, getPointDistanceInfo, hasPoints]);

  // Función para mover a un punto de ajuste específico
  const snapToPoint = point => {
    const newY = SCREEN_HEIGHT * (1 - SNAP_POINTS[point]);
    translateY.value = withSpring(newY, {
      damping: 20,
      stiffness: 200,
    });
    setCurrentSnapPoint(point);
  };

  // Función para encontrar el punto de ajuste más cercano
  const findClosestSnapPoint = currentY => {
    const currentPercentage = 1 - currentY / SCREEN_HEIGHT;

    let closestPoint = 'MEDIUM';
    let minDistance = Math.abs(currentPercentage - SNAP_POINTS.MEDIUM);

    Object.entries(SNAP_POINTS).forEach(([point, percentage]) => {
      const distance = Math.abs(currentPercentage - percentage);
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = point;
      }
    });

    return closestPoint;
  };

  // PanResponder para manejar los gestos de deslizamiento
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return (
        Math.abs(gestureState.dy) > 5 &&
        Math.abs(gestureState.dy) > Math.abs(gestureState.dx)
      );
    },

    onPanResponderGrant: () => {},

    onPanResponderMove: (evt, gestureState) => {
      const baseY = SCREEN_HEIGHT * (1 - SNAP_POINTS[currentSnapPoint]);
      const newY = baseY + gestureState.dy;

      const minY = SCREEN_HEIGHT * (1 - SNAP_POINTS.MAXIMIZED);
      const maxY = SCREEN_HEIGHT * (1 - SNAP_POINTS.MINIMIZED);

      translateY.value = Math.max(minY, Math.min(maxY, newY));
    },

    onPanResponderRelease: (evt, gestureState) => {
      const finalY = translateY.value;
      const closestPoint = findClosestSnapPoint(finalY);

      if (Math.abs(gestureState.vy) > 0.5) {
        if (gestureState.vy > 0) {
          if (currentSnapPoint === 'MAXIMIZED') {
            snapToPoint('MEDIUM');
          } else if (currentSnapPoint === 'MEDIUM') {
            snapToPoint('MINIMIZED');
          }
        } else {
          if (currentSnapPoint === 'MINIMIZED') {
            snapToPoint('MEDIUM');
          } else if (currentSnapPoint === 'MEDIUM') {
            snapToPoint('MAXIMIZED');
          }
        }
      } else {
        snapToPoint(closestPoint);
      }
    },
  });

  const renderTokenItem = ({item}) => (
    <TokenItem
      item={item}
      onPress={token => {
        // Manejar la acción de ir al token
        console.log(
          'Ir a token:',
          token.name,
          'Coordenadas:',
          token.coordinates,
        );
      }}
    />
  );

  // Estilo animado para el bottom sheet
  const animatedBottomSheetStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateY: translateY.value}],
    };
  });

  // Calcular la altura del contenido basada en el snap point actual
  const getContentHeight = () => {
    return SCREEN_HEIGHT * SNAP_POINTS[currentSnapPoint];
  };

  // Función para refrescar los puntos
  const handleRefresh = () => {
    refreshDistributionPoints();
  };

  if (isLoading || !isMapReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#07415C" />
        <Text style={styles.loadingText}>Cargando mapa...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header con información de GPS */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Icon
            name="arrow-left"
            size={16}
            color="#6B7280"
            style={{zIndex: 20}}
          />
        </TouchableOpacity>

        {/* Botón de refresh para los puntos */}
        <TouchableOpacity
          style={[styles.backButton, {marginLeft: 8}]}
          onPress={handleRefresh}
          disabled={isLoadingPoints}>
          <Icon
            name={isLoadingPoints ? 'spinner' : 'refresh'}
            size={16}
            color="#6B7280"
            style={{zIndex: 20}}
          />
        </TouchableOpacity>
      </View>

      {/* Mapa */}
      <View style={styles.mapContainer}>
        <Mapbox.MapView
          style={styles.map}
          zoomEnabled={true}
          scrollEnabled={true}
          pitchEnabled={true}
          rotateEnabled={true}
          styleURL="mapbox://styles/mapbox/light-v10">
          <Mapbox.Camera
            centerCoordinate={userLocation}
            zoomLevel={14}
            animationMode="flyTo"
            animationDuration={2000}
          />

          {/* Marcador del usuario */}
          <Mapbox.PointAnnotation id="userLocation" coordinate={userLocation}>
            <View style={styles.userMarker}>
              <View style={styles.userMarkerInner} />
            </View>
          </Mapbox.PointAnnotation>

          {/* Marcadores de puntos de distribución */}
          {distributionPoints.map((point, index) => (
            <Mapbox.PointAnnotation
              key={point.id}
              id={`distributionPoint_${point.id}`}
              coordinate={point.coordinates}>
              <View style={styles.distributionMarker}>
                <Text style={styles.distributionMarkerText}>
                  {point.quantity}
                </Text>
              </View>
            </Mapbox.PointAnnotation>
          ))}

          <TokenMarker animated={true} />
        </Mapbox.MapView>

        {/* Controles flotantes del mapa */}
        <View style={styles.mapControls}>
          <TouchableOpacity style={styles.mapControlButton}>
            <Icon name="crosshairs" size={16} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.mapControlButton}>
            <Icon name="plus" size={16} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.mapControlButton}>
            <Icon name="minus" size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Indicador de mapa interactivo */}
        <View style={styles.mapIndicator}>
          <Text style={styles.mapIndicatorText}>MAPA INTERACTIVO</Text>
        </View>
      </View>

      {/* Bottom Sheet Arrastrable */}
      <Animated.View
        style={[
          styles.bottomSheet,
          animatedBottomSheetStyle,
          {height: SCREEN_HEIGHT},
        ]}
        {...panResponder.panHandlers}>
        {/* Handle para arrastrar */}
        <View style={styles.bottomSheetHandle} />

        {/* Contenido del bottom sheet */}
        <View style={[styles.bottomSheetContent, {height: getContentHeight()}]}>
          {/* Header del bottom sheet */}
          <View style={styles.bottomSheetHeader}>
            <View style={styles.headerLeft}>
              <Icon name="map-marker" size={16} color="#E50B7B" />
              <Text style={styles.headerTitle}>
                Tokens cercanos {hasPoints && `(${distributionPoints.length})`}
              </Text>
            </View>
            {isLoadingPoints && (
              <ActivityIndicator size="small" color="#07415C" />
            )}
          </View>

          {/* Mostrar error si existe */}
          {pointsError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{pointsError}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={handleRefresh}>
                <Text style={styles.retryButtonText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Lista de tokens */}
          {
            <View style={styles.tokensSection}>
              {hasPoints ? (
                <FlatList
                  data={tokensData}
                  renderItem={renderTokenItem}
                  keyExtractor={item => item.id}
                  showsVerticalScrollIndicator={false}
                  style={styles.tokensList}
                  contentContainerStyle={styles.tokensListContent}
                />
              ) : (
                !isLoadingPoints &&
                !pointsError && (
                  <View style={styles.emptyContainer}>
                    <Icon name="map-marker" size={48} color="#9CA3AF" />
                    <Text style={styles.emptyText}>
                      No hay tokens disponibles
                    </Text>
                    <Text style={styles.emptySubtext}>
                      Los tokens aparecerán cuando estén disponibles en tu área
                    </Text>
                  </View>
                )
              )}
            </View>
          }
        </View>
      </Animated.View>
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
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'absolute',
    top: 20,
    zIndex: 999,
    paddingTop: Platform.OS === 'ios' ? 50 : 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  userMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#07415C',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  userMarkerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#07415C',
  },
  distributionMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E50B7B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  distributionMarkerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  mapControls: {
    position: 'absolute',
    top: 20,
    right: 16,
    gap: 8,
  },
  mapControlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  mapIndicator: {
    position: 'absolute',
    bottom: 20,
    left: '50%',
    transform: [{translateX: -75}],
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  mapIndicatorText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: -8},
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  bottomSheetHandle: {
    width: 48,
    height: 5,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  bottomSheetContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  tokensSection: {
    flex: 1,
  },
  tokensList: {
    flex: 1,
  },
  tokensListContent: {
    paddingBottom: 20,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    marginBottom: 8,
  },
  retryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
export default MapScreen;
