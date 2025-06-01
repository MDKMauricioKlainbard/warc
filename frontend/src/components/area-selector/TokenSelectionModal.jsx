import React, {useState} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {AreaSelectorStyles} from '../../styles/AreaSelectorStyles';

const TokenSelectionModal = ({
  visible,
  selectedPoints,
  onConfirm,
  onCancel,
  isSubmitting = false,
}) => {
  const [tokenAmount, setTokenAmount] = useState('10');
  const [error, setError] = useState('');

  const handleTokenChange = text => {
    // Solo permitir números
    const numericText = text.replace(/[^0-9]/g, '');
    setTokenAmount(numericText);

    // Validación en tiempo real
    if (numericText === '') {
      setError('La cantidad es requerida');
    } else {
      const num = parseInt(numericText);
      if (num < 1) {
        setError('Mínimo 1 token');
      } else if (num > 1000) {
        setError('Máximo 1000 tokens');
      } else {
        setError('');
      }
    }
  };

  const handleConfirm = () => {
    const amount = parseInt(tokenAmount);
    if (amount >= 1 && amount <= 1000) {
      onConfirm(amount);
    }
  };

  const isValid = tokenAmount !== '' && !error && parseInt(tokenAmount) >= 1;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Configurar Distribución</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onCancel}
              disabled={isSubmitting}>
              <Icon name="times" size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.modalContent}>
            {/* Area Summary */}
            <View style={styles.areaSummary}>
              <Icon name="map-marker" size={16} color="#4F46E5" />
              <Text style={styles.areaSummaryText}>
                Área con {selectedPoints.length} puntos seleccionados
              </Text>
            </View>

            {/* Token Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                ¿Cuántos tokens quieres distribuir?
              </Text>
              <TextInput
                style={[styles.tokenInput, error ? styles.inputError : null]}
                value={tokenAmount}
                onChangeText={handleTokenChange}
                placeholder="Ej: 10"
                keyboardType="numeric"
                maxLength={4}
                editable={!isSubmitting}
              />
              {error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : (
                <Text style={styles.helperText}>
                  Los tokens se distribuirán aleatoriamente en el área
                </Text>
              )}
            </View>

            {/* Quick Options */}
            <View style={styles.quickOptions}>
              <Text style={styles.quickOptionsLabel}>Opciones rápidas:</Text>
              <View style={styles.quickButtonsRow}>
                {[5, 10, 20, 50].map(amount => (
                  <TouchableOpacity
                    key={amount}
                    style={[
                      styles.quickButton,
                      tokenAmount === amount.toString()
                        ? styles.quickButtonActive
                        : null,
                    ]}
                    onPress={() => handleTokenChange(amount.toString())}
                    disabled={isSubmitting}>
                    <Text
                      style={[
                        styles.quickButtonText,
                        tokenAmount === amount.toString()
                          ? styles.quickButtonTextActive
                          : null,
                      ]}>
                      {amount}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
              disabled={isSubmitting}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                !isValid ? styles.confirmButtonDisabled : null,
              ]}
              onPress={handleConfirm}
              disabled={!isValid || isSubmitting}>
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text
                    style={[
                      styles.confirmButtonText,
                      !isValid ? styles.confirmButtonTextDisabled : null,
                    ]}>
                    Distribuir Tokens
                  </Text>
                  <Icon
                    name="arrow-right"
                    size={14}
                    color="#FFFFFF"
                    style={{marginLeft: 8}}
                  />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = {
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 20,
  },
  areaSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 20,
  },
  areaSummaryText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '500',
    marginLeft: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  tokenInput: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    textAlign: 'center',
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  quickOptions: {
    marginBottom: 20,
  },
  quickOptionsLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
  },
  quickButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  quickButtonActive: {
    backgroundColor: '#4F46E5',
  },
  quickButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  quickButtonTextActive: {
    color: '#FFFFFF',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  confirmButton: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  confirmButtonTextDisabled: {
    color: '#9CA3AF',
  },
};

export default TokenSelectionModal;
