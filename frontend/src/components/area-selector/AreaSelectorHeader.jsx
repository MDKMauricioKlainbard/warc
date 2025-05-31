import React from 'react';
import {View, TouchableOpacity, Text} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {AreaSelectorStyles} from '../../styles/AreaSelectorStyles';

const AreaSelectorHeader = ({
  title = 'Seleccionar Área',
  onBack,
  onClear,
  hasPoints = false,
}) => {
  return (
    <>
      {/* Header */}
      <View style={AreaSelectorStyles.header}>
        <TouchableOpacity
          style={AreaSelectorStyles.backButton}
          onPress={onBack}>
          <Icon name="arrow-left" size={16} color="#6B7280" />
        </TouchableOpacity>

        <Text style={AreaSelectorStyles.headerTitle}>{title}</Text>

        <TouchableOpacity
          style={[
            AreaSelectorStyles.clearButton,
            {opacity: hasPoints ? 1 : 0.5},
          ]}
          onPress={onClear}
          disabled={!hasPoints}>
          <Icon name="trash" size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </>
  );
};

export default AreaSelectorHeader;
