import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from 'react-native';
import MapScreen from '../map/MapScreen';
import Icon from 'react-native-vector-icons/FontAwesome';

const {width} = Dimensions.get('window');

const HomeScreen = () => {
  const [currentScreen, setCurrentScreen] = useState('home');

  const navigateToMap = () => {
    setCurrentScreen('map');
  };

  const navigateToHome = () => {
    setCurrentScreen('home');
  };

  // Datos de ejemplo para los tokens
  const tokensData = [
    {
      id: '1',
      name: 'Token Dorado',
      distance: '150m al norte',
      icon: '🏆',
      color: '#FCD34D',
    },
    {
      id: '2',
      name: 'NFT Arte Digital',
      distance: '320m al este',
      icon: '🎨',
      color: '#A78BFA',
    },
    {
      id: '3',
      name: 'Gema Rara',
      distance: '180m al sur',
      icon: '💎',
      color: '#34D399',
    },
    {
      id: '4',
      name: 'Tesoro Escondido',
      distance: '450m al oeste',
      icon: '🗝️',
      color: '#F87171',
    },
  ];

  const renderTokenItem = ({item}) => (
    <View style={styles.tokenItem}>
      <View style={[styles.tokenIcon, {backgroundColor: item.color + '20'}]}>
        <Text style={styles.tokenEmoji}>{item.icon}</Text>
      </View>
      <View style={styles.tokenInfo}>
        <Text style={styles.tokenName}>{item.name}</Text>
      </View>
      <TouchableOpacity style={styles.irButton}>
        <Text style={styles.irButtonText}>IR</Text>
      </TouchableOpacity>
    </View>
  );

  if (currentScreen === 'map') {
    return <MapScreen onBack={navigateToHome} />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Mapa interactivo placeholder */}
        <View style={styles.mapContainer}>
          <TouchableOpacity
            style={styles.mapPlaceholder}
            onPress={navigateToMap}>
            {/* Decorative icons */}
            <View style={[styles.decorativeIcon, styles.icon1]}>
              <Text style={styles.iconText}>💰</Text>
            </View>
            <View style={[styles.decorativeIcon, styles.icon2]}>
              <Text style={styles.iconText}>💎</Text>
            </View>
            <View style={[styles.decorativeIcon, styles.icon3]}>
              <Text style={styles.iconText}>🏆</Text>
            </View>

            {/* Botón central de explorar */}
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={navigateToMap}>
              <Icon
                name="globe"
                size={16}
                color="#FFFFFF"
                style={{marginRight: 8}}
              />
              <Text style={styles.exploreButtonText}>EXPLORAR</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Tokens Cercanos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>NFTs Disponibles</Text>
          </View>
        </View>

        {/* Tokens en tu área */}
        <View style={styles.tokensSection}>
          <View style={styles.tokensSectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <View style={styles.redDot} />
              <Text style={styles.sectionTitle}>
                Tokens en tu área (Radio 2km)
              </Text>
            </View>
          </View>

          <FlatList
            data={tokensData}
            renderItem={renderTokenItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
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
  mapPlaceholder: {
    height: 200,
    borderRadius: 16,
    backgroundColor: 'linear-gradient(135deg, #E0F2FE 0%, #F3E8FF 100%)',
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
  },
  decorativeIcon: {
    position: 'absolute',
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
  icon1: {
    top: 30,
    left: 30,
  },
  icon2: {
    top: 30,
    right: 30,
  },
  icon3: {
    bottom: 30,
    left: 30,
  },
  iconText: {
    fontSize: 20,
  },
  exploreButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#4F46E5',
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
    backgroundColor: '#3B82F6',
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
    color: '#DBEAFE',
    textAlign: 'center',
  },
  tokensSection: {
    paddingHorizontal: 16,
    paddingTop: 32,
  },
  tokensSectionHeader: {
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  tokenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
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
  },
  irButton: {
    backgroundColor: '#10B981',
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

export default HomeScreen;
