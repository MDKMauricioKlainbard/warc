import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import Mapbox from '@rnmapbox/maps';
import Geolocation from '@react-native-community/geolocation';
import TokenMarker from '../../components/map/TokenMarker';
import Icon from 'react-native-vector-icons/FontAwesome';

// Configurar tu token de Mapbox aquí
Mapbox.setAccessToken('sk.eyJ1IjoiZ2FsdTc3NzciLCJhIjoiY21iYjl5OTc0MGZobDJycHh5Y2JrZ3poNCJ9.qbuqOJvDIL8G9ZuKOswYdA');

const MapScreen = ({ onBack }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showBottomSheet, setShowBottomSheet] = useState(true);

  // Datos de ejemplo para los tokens cercanos
  const tokensData = [
    {
      id: '1',
      name: 'Token Dorado',
      distance: '150m al norte',
      icon: '🏆',
      color: '#FCD34D',
      status: 'En rango',
      statusColor: '#10B981',
    },
    {
      id: '2',
      name: 'NFT Arte Digital',
      distance: '320m al este',
      icon: '🎨',
      color: '#A78BFA',
      status: 'Caminar',
      statusColor: '#F59E0B',
    },
    {
      id: '3',
      name: 'Gema Rara',
      distance: '180m al sur',
      icon: '💎',
      color: '#34D399',
      status: 'Caminar',
      statusColor: '#F59E0B',
    },
  ];

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Permiso de Ubicación',
            message: 'Esta app necesita acceso a tu ubicación para mostrar el mapa',
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
      (position) => {
        setUserLocation([
          position.coords.longitude,
          position.coords.latitude,
        ]);
        setIsLoading(false);
      },
      (error) => {
        console.log('Error obteniendo ubicación:', error);
        Alert.alert('Error', 'No se pudo obtener la ubicación');
        setDefaultLocation();
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const setDefaultLocation = () => {
    // Ubicación por defecto (México DF)
    setUserLocation([-99.1332, 19.4326]);
    setIsLoading(false);
  };

  const renderTokenItem = ({ item }) => (
    <View style={styles.tokenItem}>
      <View style={[styles.tokenIcon, { backgroundColor: item.color + '20' }]}>
        <Text style={styles.tokenEmoji}>{item.icon}</Text>
      </View>
      <View style={styles.tokenInfo}>
        <Text style={styles.tokenName}>{item.name}</Text>
        <Text style={styles.tokenDistance}>📍 {item.distance}</Text>
        <Text style={[styles.tokenStatus, { color: item.statusColor }]}>
          ⚡ {item.status}
        </Text>
      </View>
      <TouchableOpacity style={[styles.irButton, { backgroundColor: item.statusColor }]}>
        <Text style={styles.irButtonText}>IR</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading || !userLocation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
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
            style={{ zIndex: 20}}
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

          {/* Marcador de ubicación del usuario */}
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

      {/* Bottom Sheet */}
      {showBottomSheet && (
        <View style={styles.bottomSheet}>
          {/* Handle */}
          <View style={styles.bottomSheetHandle} />

          {/* Botón AR */}
          <TouchableOpacity style={styles.arButton}>
            <Icon
              name="camera"
              size={16}
              color="#FFFFFF"
              style={{marginRight: 8}}
            />
            <Text style={styles.arButtonText}>ABRIR CÁMARA AR</Text>
          </TouchableOpacity>

          {/* Tokens Cercanos */}
          <View style={styles.tokensSection}>
            <View style={styles.tokensSectionHeader}>
              <View style={styles.redDot} />
              <Text style={styles.sectionTitle}>Tokens Cercanos</Text>
            </View>

            <FlatList
              data={tokensData}
              renderItem={renderTokenItem}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              style={styles.tokensList}
            />
          </View>
        </View>
      )}
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
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gpsStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gpsIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginRight: 6,
  },
  gpsText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  batteryStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  batteryText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  networkText: {
    fontSize: 14,
    color: '#374151',
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
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#4F46E5',
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
    backgroundColor: '#4F46E5',
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
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
    maxHeight: '50%',
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  arButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#4F46E5',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  arButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tokensSection: {
    flex: 1,
  },
  tokensSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  tokensList: {
    flex: 1,
  },
  tokenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tokenIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tokenEmoji: {
    fontSize: 20,
  },
  tokenInfo: {
    flex: 1,
  },
  tokenName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  tokenDistance: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 2,
  },
  tokenStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  irButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 44,
    alignItems: 'center',
  },
  irButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default MapScreen;