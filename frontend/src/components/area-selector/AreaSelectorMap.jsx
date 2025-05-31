import React from 'react';
import {View, Text, Animated, Alert} from 'react-native';
import Mapbox from '@rnmapbox/maps';
import Icon from 'react-native-vector-icons/FontAwesome';
import {AreaSelectorStyles} from '../../styles/AreaSelectorStyles';
import AreaSelectorControls from './AreaSelectorControls';

const AreaSelectorMap = ({
  userLocation,
  selectedPoints,
  polygonGeoJSON,
  linesGeoJSON,
  animatedValue,
  onMapPress,
  onPointRemove,
  onRecenter,
  onUndo,
}) => {
  const handlePointPress = point => {
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
    <View style={AreaSelectorStyles.mapContainer}>
      <Mapbox.MapView
        style={AreaSelectorStyles.map}
        zoomEnabled={true}
        scrollEnabled={true}
        pitchEnabled={false}
        rotateEnabled={true}
        styleURL="mapbox://styles/mapbox/light-v10"
        onPress={onMapPress}>
        <Mapbox.Camera
          centerCoordinate={userLocation}
          zoomLevel={16}
          animationMode="flyTo"
          animationDuration={2000}
        />

        {/* Marcador de ubicación del usuario */}
        <Mapbox.PointAnnotation id="userLocation" coordinate={userLocation}>
          <Animated.View
            style={[
              AreaSelectorStyles.userMarker,
              {
                transform: [
                  {
                    scale: animatedValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.3],
                    }),
                  },
                ],
              },
            ]}>
            <View style={AreaSelectorStyles.userMarkerInner} />
          </Animated.View>
        </Mapbox.PointAnnotation>

        {/* Marcadores de puntos seleccionados */}
        {selectedPoints.map(point => (
          <Mapbox.PointAnnotation
            key={point.id}
            id={point.id}
            coordinate={point.coordinates}
            onSelected={() => handlePointPress(point)}>
            <View style={AreaSelectorStyles.selectedPointMarker}>
              <Text style={AreaSelectorStyles.pointNumber}>{point.order}</Text>
              <View style={AreaSelectorStyles.deleteIndicator}>
                <Icon name="times" size={8} color="#FFFFFF" />
              </View>
            </View>
          </Mapbox.PointAnnotation>
        ))}

        {/* Líneas del polígono */}
        {linesGeoJSON && (
          <Mapbox.ShapeSource id="lines" shape={linesGeoJSON}>
            <Mapbox.LineLayer
              id="lineLayer"
              style={{
                lineColor: '#4F46E5',
                lineWidth: 3,
                lineOpacity: 0.8,
              }}
            />
          </Mapbox.ShapeSource>
        )}

        {/* Área sombreada del polígono */}
        {polygonGeoJSON && (
          <Mapbox.ShapeSource id="polygon" shape={polygonGeoJSON}>
            <Mapbox.FillLayer
              id="fillLayer"
              style={{
                fillColor: '#4F46E5',
                fillOpacity: 0.2,
              }}
            />
          </Mapbox.ShapeSource>
        )}
      </Mapbox.MapView>

      {/* Controles flotantes */}
      <AreaSelectorControls
        onRecenter={onRecenter}
        onUndo={onUndo}
        hasPoints={selectedPoints.length > 0}
      />
    </View>
  );
};

export default AreaSelectorMap;
