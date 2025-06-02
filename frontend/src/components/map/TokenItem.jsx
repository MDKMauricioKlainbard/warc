import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

const TokenItem = ({item, onPress, showStatus = true}) => {
  const getButtonColor = status => {
    switch (status) {
      case 'En rango':
        return '#E50B7B';
      case 'Zona AR':
        return '#06B6D4';
      case 'Caminar':
        return '#9CA3AF';
      default:
        return '#E50B7B';
    }
  };

  const getIconForQuantity = quantity => {
    if (quantity >= 5) return '🏆';
    if (quantity >= 3) return '💎';
    return '📦';
  };

  const displayIcon = item.icon || getIconForQuantity(item.quantity || 1);

  return (
    <View style={styles.tokenItem}>
      <View style={styles.tokenIconContainer}>
        <View
          style={[
            styles.tokenIcon,
            {backgroundColor: item.color || '#07415C'},
          ]}>
          <Text style={styles.tokenEmoji}>{displayIcon}</Text>
        </View>
      </View>

      <View style={styles.tokenInfo}>
        <Text style={styles.tokenName}>{item.name}</Text>
        <Text style={styles.tokenDistance}>{item.distance}</Text>
        {showStatus && item.status && (
          <Text
            style={[
              styles.tokenStatus,
              {color: item.statusColor || '#9CA3AF'},
            ]}>
            {item.status}
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.irButton,
          {backgroundColor: getButtonColor(item.status)},
        ]}
        onPress={() => onPress && onPress(item)}>
        <Text style={styles.irButtonText}>Ir</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tokenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  tokenIconContainer: {
    marginRight: 16,
  },
  tokenIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tokenEmoji: {
    fontSize: 22,
  },
  tokenInfo: {
    flex: 1,
  },
  tokenName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#07415C',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  tokenDistance: {
    fontSize: 14,
    color: '#5d7885',
    fontWeight: '400',
    marginBottom: 2,
  },
  tokenStatus: {
    fontSize: 13,
    fontWeight: '500',
  },
  irButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  irButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default TokenItem;
