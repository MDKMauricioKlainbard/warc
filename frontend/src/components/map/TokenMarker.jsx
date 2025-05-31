import React, { useState } from 'react';
import {
  View,
  Animated,
  Image,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import Mapbox from '@rnmapbox/maps';
import {Circle, Svg} from 'react-native-svg';

const Wave = ({
  size = 60,
  color = '#ffff00',
  duration = 1000,
  delay = 0,
}) => {
  const waveAnimation = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(waveAnimation, {
        toValue: 1,
        duration,
        useNativeDriver: true,
        delay,
      }),
    ).start();
  }, []);

  const waveStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    position: 'absolute',
    borderWidth: 3,
    borderColor: color,
  };

  return (
    <Animated.View
      style={[
        waveStyle,
        {
          transform: [
            {
              scale: waveAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 2.5],
              }),
            },
          ],
          opacity: waveAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0],
          }),
        },
      ]}
    />
  );
};

const TokenMarker = ({
  markerColor = '#2a2a2a',
  markerStrokeColor = '#E91E63',
  waveConfig = {},
  animated,
}) => {
  const imageSource = require('../../../assets/logo-warc.png');
  const [location, setLocation] = useState();
  const translateY = React.useRef(new Animated.Value(0)).current;
  const scale = React.useRef(new Animated.Value(1)).current;
  
  React.useEffect(() => {
    const bounceAnimation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -10,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );

    bounceAnimation.start();

    return () => bounceAnimation.stop();
  }, []);
  
  const press = () => {
    console.log('Marker pressed');
  }

  return (
    <Mapbox.MarkerView
      id={`${123456}`}
      coordinate={[-68.0234247155125, 10.2869408818048]}>
      <View style={styles.markerContainer}>
        <Animated.View
          style={[
            styles.animatedContainer,
            {
              transform: [{translateY}, {scale}],
            },
          ]}>
          {animated && <Wave size={30} color={'#E91E63'} {...waveConfig} />}
          <View style={styles.marker}>
            <Svg height="40" width="40" viewBox="0 0 40 40">
              <Circle
                cx="20"
                cy="20"
                r="15"
                fill={markerColor}
                stroke={markerStrokeColor}
                strokeWidth="1"
              />
            </Svg>
            {/* {imageSource && ( */}
            <TouchableWithoutFeedback onPress={press}>
              <Animated.View style={styles.imageContainer}>
                <Image source={imageSource} style={styles.image} />
              </Animated.View>
            </TouchableWithoutFeedback>
            {/* )} */}
          </View>
          {animated && <View style={styles.shadow} />}
        </Animated.View>
      </View>
    </Mapbox.MarkerView>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80, // Tamaño del contenedor
    height: 80, // Tamaño del contenedor
    borderRadius: 40, // Asegura que sea redondo
    overflow: 'hidden', // Recorta cualquier desbordamiento
    position: 'relative', // Mantiene la posición para las ondas
  },
  animatedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
  },
  marker: {
    width: 40, // Tamaño del círculo interno
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 10,
  },
  shadow: {
    position: 'absolute',
    bottom: -5,
    width: 30,
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 10,
  },
  imageContainer: {
    position: 'absolute',
    width: 25,
    height: 25,
    borderRadius: 12.5,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12.5,
  },
});

export default TokenMarker;