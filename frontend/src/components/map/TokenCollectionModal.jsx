import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import config from '../../../config';
import {getUser, getToken} from '../../utils/auth';

const API_BASE_URL = config.API_URL;

const TokenCollectionModal = ({
  visible,
  onClose,
  tokenData,
  userLocation,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const collectToken = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const user = await getUser();
      const token = await getToken();

      console.log('Debug - User data:', user);
      console.log('Debug - Token data:', token);

      if (!user || !token) {
        throw new Error('Usuario no autenticado');
      }

      // Decodificar el JWT para obtener el userId
      let userId;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload._id || payload.id || payload.userId;
        console.log('Debug - JWT payload:', payload);
        console.log('Debug - Extracted userId from JWT:', userId);
      } catch (jwtError) {
        console.error('Error decodificando JWT:', jwtError);
        throw new Error('Token inválido');
      }

      if (!userId) {
        throw new Error('ID de usuario no encontrado en el token');
      }

      const requestBody = {
        coordinateId: tokenData.id,
        userPosition: userLocation,
        userId: userId,
      };

      console.log(
        'Debug - Request body:',
        JSON.stringify(requestBody, null, 2),
      );

      const response = await axios.post(
        `${API_BASE_URL}/api/distributed-token/exchange-tokens`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          timeout: 15000,
        },
      );

      console.log('Debug - Response:', response.data);

      if (response.status === 200) {
        setSuccess(true);
        if (onSuccess) {
          onSuccess(tokenData);
        }
      }
    } catch (error) {
      console.error('Error al recolectar token:', error);
      console.error('Error response:', error.response?.data);

      let errorMessage = 'Error desconocido';

      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Tiempo de espera agotado. Verifica tu conexión.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status) {
        errorMessage = `Error del servidor: ${error.response.status}`;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setSuccess(false);
    onClose();
  };

  const handleRetry = () => {
    setError(null);
    collectToken();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Icon name="star" size={20} color="#E50B7B" />
              <Text style={styles.title}>Token Disponible</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Icon name="times" size={18} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {success ? (
              <>
                <View style={styles.successIcon}>
                  <Icon name="check-circle" size={48} color="#10B981" />
                </View>
                <Text style={styles.successTitle}>¡Token Recolectado!</Text>
                <Text style={styles.successMessage}>
                  Has recolectado exitosamente el token. Los tokens se han
                  añadido a tu cuenta.
                </Text>
                <TouchableOpacity
                  style={styles.successButton}
                  onPress={handleClose}>
                  <Text style={styles.successButtonText}>Continuar</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.tokenInfo}>
                  <Text style={styles.tokenName}>
                    {tokenData?.name || 'Token'}
                  </Text>
                  <Text style={styles.tokenQuantity}>
                    Cantidad: {tokenData?.quantity || 1} tokens
                  </Text>
                  <Text style={styles.tokenDistance}>
                    Distancia: {tokenData?.distance || 'En rango'}
                  </Text>
                </View>

                {error && (
                  <View style={styles.errorContainer}>
                    <Icon
                      name="exclamation-triangle"
                      size={16}
                      color="#EF4444"
                    />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                <View style={styles.actions}>
                  {error ? (
                    <TouchableOpacity
                      style={styles.retryButton}
                      onPress={handleRetry}
                      disabled={isLoading}>
                      {isLoading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.retryButtonText}>Reintentar</Text>
                      )}
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.collectButton}
                      onPress={collectToken}
                      disabled={isLoading}>
                      {isLoading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.collectButtonText}>
                          Recolectar Token
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleClose}>
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  tokenInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  tokenName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  tokenQuantity: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  tokenDistance: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  actions: {
    gap: 12,
  },
  collectButton: {
    backgroundColor: '#E50B7B',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  collectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
  successIcon: {
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  successButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  successButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TokenCollectionModal;
