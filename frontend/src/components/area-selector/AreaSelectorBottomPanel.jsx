import React from 'react';
import {View, TouchableOpacity, Text, Alert} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {AreaSelectorStyles} from '../../styles/AreaSelectorStyles';

const AreaSelectorBottomPanel = ({
  selectedPoints,
  canProceed,
  onPointRemove,
  onNext,
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
                onPress={() => handlePointChipPress(point)}>
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
          {backgroundColor: canProceed ? '#4F46E5' : '#D1D5DB'},
        ]}
        onPress={onNext}
        disabled={!canProceed}>
        <Text
          style={[
            AreaSelectorStyles.nextButtonText,
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
  );
};

export default AreaSelectorBottomPanel;
