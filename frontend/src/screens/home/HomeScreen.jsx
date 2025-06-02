import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import MapScreen from '../map/MapScreen';
import Icon from 'react-native-vector-icons/FontAwesome';
import TokenItem from '../../components/map/TokenItem';
import {useDistributionPoints} from '../../hooks/UseDistributionPoints';

const {width} = Dimensions.get('window');

const HomeScreen = () => {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [targetCoordinates, setTargetCoordinates] = useState(null);

  // Usar el hook para obtener datos reales de los tokens
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
    calculateDistance,
  } = useDistributionPoints();

  const navigateToMap = (coordinates = null) => {
    setTargetCoordinates(coordinates);
    setCurrentScreen('map');
  };

  const navigateToHome = () => {
    setCurrentScreen('home');
    setTargetCoordinates(null);
  };

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
          distanceInfo.distance < 0.01
            ? 'En rango'
            : distanceInfo.distance < 0.5
            ? 'Caminar'
            : 'Zona AR',
        statusColor:
          distanceInfo.distance < 0.01
            ? '#E50B7B'
            : distanceInfo.distance < 0.5
            ? '#9CA3AF'
            : '#06B6D4',
        coordinates: point.coordinates,
        quantity: point.quantity,
      };
    });
  }, [distributionPoints, userLocation, getPointDistanceInfo, hasPoints]);

  // Separar tokens por estado para las estadísticas
  const tokensInRange = tokensData.filter(token => token.status === 'En rango');
  const nftTokens = tokensData.filter(token => token.quantity >= 3);

  const handleTokenPress = token => {
    console.log('Navegando a token:', token.name, token.coordinates);
    navigateToMap(token.coordinates);
  };

  const renderTokenItem = ({item}) => (
    <TokenItem item={item} onPress={handleTokenPress} showStatus={false} />
  );

  if (currentScreen === 'map') {
    return (
      <MapScreen
        onBack={navigateToHome}
        initialTargetCoordinates={targetCoordinates}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Mapa preview */}
        <View style={styles.mapContainer}>
          <TouchableOpacity
            style={styles.mapPreview}
            onPress={() => navigateToMap()}>
            {/* Placeholder para preview del mapa */}
            <View style={styles.mapPlaceholder}>
              {/* Markers decorativos */}
              <View style={[styles.marker, styles.marker1]}>
                <View style={styles.markerInner} />
              </View>
              <View style={[styles.marker, styles.marker2]}>
                <View style={styles.markerInner} />
              </View>
              <View style={[styles.marker, styles.marker3]}>
                <View style={styles.markerInner} />
              </View>
              <View style={[styles.marker, styles.marker4]}>
                <View style={styles.markerInner} />
              </View>
              <View style={[styles.marker, styles.marker5]}>
                <View style={styles.markerInner} />
              </View>

              {/* Grid pattern */}
              <View style={styles.gridPattern}>
                {Array.from({length: 6}).map((_, row) =>
                  Array.from({length: 8}).map((_, col) => (
                    <View key={`${row}-${col}`} style={styles.gridDot} />
                  )),
                )}
              </View>
            </View>

            {/* Botón central de explorar */}
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => navigateToMap()}>
              <Text style={styles.exploreButtonText}>Explorar</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {isLoadingPoints ? '...' : distributionPoints.length}
            </Text>
            <Text style={styles.statLabel}>tokens cercanos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {isLoadingPoints ? '...' : nftTokens.length}
            </Text>
            <Text style={styles.statLabel}>NFTs disponibles</Text>
          </View>
        </View>

        {/* Tokens en tu área */}
        <View style={styles.tokensSection}>
          <View style={styles.tokensSectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Icon name="map-marker" size={16} color="#E50B7B" />
              <Text style={styles.sectionTitle}>
                Tokens en tu área (radio 2km)
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
                onPress={refreshDistributionPoints}>
                <Text style={styles.retryButtonText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Lista de tokens o mensaje vacío */}
          {hasPoints ? (
            <FlatList
              data={tokensData}
              renderItem={renderTokenItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            !isLoadingPoints &&
            !pointsError && (
              <View style={styles.emptyContainer}>
                <Icon name="map-marker" size={48} color="#9CA3AF" />
                <Text style={styles.emptyText}>No hay tokens disponibles</Text>
                <Text style={styles.emptySubtext}>
                  Los tokens aparecerán cuando estén disponibles en tu área
                </Text>
              </View>
            )
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  mapContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  mapPreview: {
    height: 200,
    borderRadius: 16,
    backgroundColor: '#E8F4FD',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  mapPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#E8F4FD',
  },
  gridPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  gridDot: {
    width: 2,
    height: 2,
    backgroundColor: '#B8D4E8',
    borderRadius: 1,
    margin: 8,
  },
  marker: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E50B7B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  marker1: {
    top: 30,
    left: 40,
  },
  marker2: {
    top: 50,
    right: 60,
  },
  marker3: {
    bottom: 60,
    left: 30,
  },
  marker4: {
    top: 80,
    left: '50%',
    marginLeft: -6,
  },
  marker5: {
    bottom: 40,
    right: 40,
  },
  markerInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  exploreButton: {
    backgroundColor: '#0B4A5C',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#0B4A5C',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#E50B7B',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  tokensSection: {
    paddingHorizontal: 16,
    paddingTop: 32,
  },
  tokensSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 8,
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

export default HomeScreen;
