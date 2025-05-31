import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {AreaSelectorStyles} from '../styles/AreaSelectorStyles';

const AreaSelectorControls = ({onRecenter, onUndo, hasPoints = false}) => {
  return (
    <View style={AreaSelectorStyles.mapControls}>
      <TouchableOpacity
        style={AreaSelectorStyles.mapControlButton}
        onPress={onRecenter}>
        <Icon name="crosshairs" size={16} color="#6B7280" />
      </TouchableOpacity>

      {hasPoints && (
        <TouchableOpacity
          style={[
            AreaSelectorStyles.mapControlButton,
            AreaSelectorStyles.undoButton,
          ]}
          onPress={onUndo}>
          <Icon name="undo" size={16} color="#EF4444" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default AreaSelectorControls;
