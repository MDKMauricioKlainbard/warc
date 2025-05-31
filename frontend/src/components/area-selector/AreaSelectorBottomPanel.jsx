import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {AreaSelectorStyles} from '../../styles/AreaSelectorStyles';

const AreaSelectorBottomPanel = ({
  selectedPoints,
  canProceed,
  isSubmitting,
  submitError,
  onPointRemove,
  onNext,
  onClearError,
}) => {
  const handlePointChipPress = point => {
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
          onPress: () => onPointRemove(point.id),
        },
      ],
    );
  };

  return (
    <View style={AreaSelectorStyles.bottomPanel}>
      {/* Error Message */}
      {submitError && (
        <View style={AreaSelectorStyles.errorContainer}>
          <View style={AreaSelectorStyles.errorContent}>
            <Icon name="exclamation-triangle" size={16} color="#EF4444" />
            <Text style={AreaSelectorStyles.errorText}>{submitError}</Text>
          </View>
          <TouchableOpacity
            style={AreaSelectorStyles.errorCloseButton}
            onPress={onClearError}>
            <Icon name="times" size={12} color="#EF4444" />
          </TouchableOpacity>
        </View>
      )}

      {selectedPoints.length > 0 && (
        <View style={AreaSelectorStyles.selectedPointsList}>
          <Text style={AreaSelectorStyles.selectedPointsTitle}>
            Puntos seleccionados:
          </Text>
          <View style={AreaSelectorStyles.pointsRow}>
            {selectedPoints.map((point, index) => (
              <TouchableOpacity
                key={point.id}
                style={AreaSelectorStyles.pointChip}
                onPress={() => handlePointChipPress(point)}
                disabled={isSubmitting}>
                <Text style={AreaSelectorStyles.pointChipText}>
                  {index + 1}
                </Text>
                <View style={AreaSelectorStyles.chipDeleteIcon}>
                  <Icon name="times" size={8} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={AreaSelectorStyles.pointsHint}>
            Toca un punto para eliminarlo
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[
          AreaSelectorStyles.nextButton,
          {
            backgroundColor: canProceed ? '#4F46E5' : '#D1D5DB',
            opacity: isSubmitting ? 0.7 : 1,
          },
        ]}
        onPress={onNext}
        disabled={!canProceed}>
        {isSubmitting && (
          <ActivityIndicator
            size="small"
            color="#FFFFFF"
            style={{marginRight: 8}}
          />
        )}
        <Text
          style={[
            AreaSelectorStyles.nextButtonText,
            {color: canProceed ? '#FFFFFF' : '#9CA3AF'},
          ]}>
          {isSubmitting
            ? 'Enviando...'
            : `Siguiente ${
                canProceed ? `(${selectedPoints.length} puntos)` : ''
              }`}
        </Text>
        {!isSubmitting && (
          <Icon
            name="arrow-right"
            size={16}
            color={canProceed ? '#FFFFFF' : '#9CA3AF'}
            style={{marginLeft: 8}}
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default AreaSelectorBottomPanel;