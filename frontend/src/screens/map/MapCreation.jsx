import React, {useState} from 'react';
import {View, Text, ActivityIndicator, Animated} from 'react-native';
import Mapbox from '@rnmapbox/maps';

// Componentes modularizados
import AreaSelectorHeader from '../../components/area-selector/AreaSelectorHeader';
import AreaSelectorMap from '../../components/area-selector/AreaSelectorMap';
import AreaSelectorBottomPanel from '../../components/area-selector/AreaSelectorBottomPanel';
import TokenSelectionModal from '../../components/area-selector/TokenSelectionModal';

// Hook personalizado y estilos
import {useAreaSelector} from '../../hooks/useAreaSelector';
import {AreaSelectorStyles} from '../../styles/AreaSelectorStyles';

const AreaSelectorScreen = ({onBack}) => {
  const [animatedValue] = useState(new Animated.Value(0));

  // Hook personalizado con toda la lógica actualizada
  const {
    userLocation,
    isLoading,
    selectedPoints,
    canProceed,
    isMapReady,
    polygonGeoJSON,
    linesGeoJSON,
    isSubmitting,
    submitError,
    showTokenModal, // Nuevo estado
    successMessage, // Nuevo estado para mensaje de éxito
    handleMapPress,
    removePoint,
    removeLastPoint,
    clearAllPoints,
    openTokenModal, // Nueva función
    closeTokenModal, // Nueva función
    handleTokenSubmit, // Nueva función
    clearSuccessMessage, // Nueva función
    getCurrentLocation,
    clearSubmitError,
  } = useAreaSelector();

  // Iniciar animación de pulso
  React.useEffect(() => {
    const startPulseAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    };

    startPulseAnimation();
  }, [animatedValue]);

  // Handler para confirmar tokens y proceder
  const handleTokenConfirm = async tokenAmount => {
    try {
      // Ejecutar la función de envío de tokens
      const result = await handleTokenSubmit(tokenAmount);

      if (result && result.success) {
        console.log('Tokens distribuidos exitosamente:', result);
        // El hook ya maneja la limpieza de puntos y muestra el mensaje de éxito
      }
    } catch (error) {
      // Los errores ya se manejan en handleTokenSubmit
      console.log('Error manejado en handleTokenSubmit:', error.message);
    }
  };

  // Pantalla de carga
  if (!isMapReady) {
    return (
      <View style={AreaSelectorStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={AreaSelectorStyles.loadingText}>Cargando mapa...</Text>
      </View>
    );
  }

  return (
    <View style={AreaSelectorStyles.container}>
      {/* Header */}
      <AreaSelectorHeader
        title="Seleccionar Área"
        onBack={onBack}
        onClear={clearAllPoints}
        hasPoints={selectedPoints.length > 0}
      />

      {/* Instrucciones */}
      <View style={AreaSelectorStyles.instructionsContainer}>
        <Text style={AreaSelectorStyles.instructionsText}>
          Selecciona mínimo 3 puntos para crear un área
        </Text>
        <Text style={AreaSelectorStyles.pointsCounter}>
          {selectedPoints.length}/6 puntos seleccionados
        </Text>
      </View>

      {/* Mapa */}
      <AreaSelectorMap
        userLocation={userLocation}
        selectedPoints={selectedPoints}
        polygonGeoJSON={polygonGeoJSON}
        linesGeoJSON={linesGeoJSON}
        animatedValue={animatedValue}
        onMapPress={handleMapPress}
        onPointRemove={removePoint}
        onRecenter={getCurrentLocation}
        onUndo={removeLastPoint}
      />

      {/* Panel inferior actualizado */}
      <AreaSelectorBottomPanel
        selectedPoints={selectedPoints}
        canProceed={canProceed}
        submitError={submitError}
        successMessage={successMessage} // Nueva prop
        onPointRemove={removePoint}
        onOpenTokenModal={openTokenModal}
        onClearError={clearSubmitError}
        onClearSuccess={clearSuccessMessage} // Nueva prop
      />

      {/* Modal de selección de tokens */}
      <TokenSelectionModal
        visible={showTokenModal}
        selectedPoints={selectedPoints}
        onConfirm={handleTokenConfirm}
        onCancel={closeTokenModal}
        isSubmitting={isSubmitting}
      />
    </View>
  );
};

export default AreaSelectorScreen;
