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

// Configurar tu token de Mapbox aquí
Mapbox.setAccessToken(
  'sk.eyJ1IjoiZ2FsdTc3NzciLCJhIjoiY21iYjl5OTc0MGZobDJycHh5Y2JrZ3poNCJ9.qbuqOJvDIL8G9ZuKOswYdA',
);

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

// Definir los puntos de ajuste como porcentajes de la altura de la pantalla
const SNAP_POINTS = {
  MINIMIZED: 0.15, // 15%
  MEDIUM: 0.45, // 45%
  MAXIMIZED: 0.85, // 85%
};

const MapScreen = ({onBack}) => {
  const [userLocation, setUserLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSnapPoint, setCurrentSnapPoint] = useState('MEDIUM');

  // Animated value para la posición del bottom sheet
  const translateY = useSharedValue(SCREEN_HEIGHT * (1 - SNAP_POINTS.MEDIUM));

  // Datos de ejemplo para los tokens cercanos
  const tokensData = [
    {
      id: '1',
      name: 'Token dorado',
      distance: '10 m al norte',
      icon: '🏆',
      color: '#07415C',
      status: 'En rango',
      statusColor: '#E50B7B',
    },
    {
      id: '2',
      name: 'NFT arte digital',
      distance: '320 m al este',
      icon: '🎨',
      color: '#07415C',
      status: 'Caminar',
      statusColor: '#9CA3AF',
    },
    {
      id: '3',
      name: 'Gema rara',
      distance: '180 m al sur',
      icon: '💎',
      color: '#07415C',
      status: 'Caminar',
      statusColor: '#9CA3AF',
    },
    {
      id: '4',
      name: 'Tesoro raro',
      distance: '450 m al oeste',
      icon: '📦',
      color: '#07415C',
      status: 'Zona AR',
      statusColor: '#06B6D4',
    },
  ];

  useEffect(() => {
    requestLocationPermission();
  }, []);

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

  const renderTokenItem = ({item}) => (
    <TokenItem
      item={item}
      onPress={token => {
        // Manejar la acción de ir al token
        console.log('Ir a token:', token.name);
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

  if (isLoading || !userLocation) {
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

          <Mapbox.PointAnnotation id="userLocation" coordinate={userLocation}>
            <View style={styles.userMarker}>
              <View style={styles.userMarkerInner} />
            </View>
          </Mapbox.PointAnnotation>

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
              <Text style={styles.headerTitle}>Tokens cercanos</Text>
            </View>
          </View>

          {/* Lista de tokens */}
          {currentSnapPoint !== 'MINIMIZED' && (
            <View style={styles.tokensSection}>
              <FlatList
                data={tokensData}
                renderItem={renderTokenItem}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                style={styles.tokensList}
                contentContainerStyle={styles.tokensListContent}
              />
            </View>
          )}
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
    justifyContent: 'space-between',
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
  
});

export default MapScreen;
