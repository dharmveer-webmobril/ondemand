 
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  Platform,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText, CustomButton } from '@components/common';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
// import { VectoreIcons } from '@components/common';

type ImagePickerModalProps = {
  visible: boolean;
  onClose: () => void;
  onImageSelected: (image: any) => void;
  types?: string;
};

const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
  visible,
  onClose,
  onImageSelected,
}) => {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();

  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: t('imagePickerModal.cameraPermissionTitle') || 'Camera Permission',
            message: t('imagePickerModal.cameraPermissionMessage') || 'App needs access to your camera',
            buttonNeutral: t('imagePickerModal.askMeLater') || 'Ask Me Later',
            buttonNegative: t('imagePickerModal.cancel') || 'Cancel',
            buttonPositive: t('imagePickerModal.ok') || 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Camera permission error:', err);
        return false;
      }
    }
    return true; // iOS handles permissions automatically
  };

  const openCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert(
        t('imagePickerModal.permissionDenied') || 'Permission Denied',
        t('imagePickerModal.cameraPermissionRequired') || 'Camera permission is required to capture images.'
      );
      return;
    }

    try {
      const image = await ImagePicker.openCamera({
        width: 1280,
        height: 1080,
        compressImageMaxWidth: 1280,
        compressImageMaxHeight: 1080,
        compressImageQuality: 0.5,
        cropping: false,
        mediaType: 'photo',
      });
      onImageSelected(image);
      onClose();
    } catch (error: any) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.warn('Camera error:', error);
        Alert.alert(
          t('messages.error') || 'Error',
          t('imagePickerModal.cameraError') || 'Failed to capture image. Please try again.'
        );
      }
    }
  };

  const openGallery = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 1280,
        height: 1080,
        compressImageMaxWidth: 1280,
        compressImageMaxHeight: 1080,
        compressImageQuality: 0.5,
        cropping: false,
        mediaType: 'photo',
      });
      onImageSelected(image);
      onClose();
    } catch (error: any) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.warn('Gallery error:', error);
        Alert.alert(
          t('messages.error') || 'Error',
          t('imagePickerModal.galleryError') || 'Failed to select image. Please try again.'
        );
      }
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
          <View style={styles.content}>
            <CustomText style={styles.title}>
              {t('imagePickerModal.title') || 'Select Image'}
            </CustomText>

            <View style={styles.divider} />

            <Pressable style={styles.button} onPress={openCamera}>
              <View style={styles.buttonContent}>
                {/* <VectoreIcons
                  icon="Ionicons"
                  name="camera-outline"
                  size={theme.SF(24)}
                  color={theme.colors.text}
                /> */}
                <CustomText style={styles.buttonText}>
                  {t('imagePickerModal.capture_image') || '📷 Capture Image'}
                </CustomText>
              </View>
            </Pressable>

            <View style={styles.divider} />

            <Pressable style={[styles.button, styles.lastButton]} onPress={openGallery}>
              <View style={styles.buttonContent}>
                {/* <VectoreIcons
                  icon="Ionicons"
                  name="images-outline"
                  size={theme.SF(24)}
                  color={theme.colors.text}
                /> */}
                <CustomText style={styles.buttonText}>
                  {t('imagePickerModal.upload_from_gallery') || '🖼️ Upload from Gallery'}
                </CustomText>
              </View>
            </Pressable>

            <View style={styles.divider} />
          </View>

          <View style={styles.cancelButtonContainer}>
            <CustomButton
              onPress={onClose}
              title={t('imagePickerModal.cancel') || 'Cancel'}
              buttonStyle={styles.cancelButton}
              buttonTextStyle={styles.cancelButtonText}
              backgroundColor={theme.colors.white}
              textColor={theme.colors.errorText || '#FF0000'}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContainer: {
      width: '100%',
    },
    content: {
      backgroundColor: theme.colors.white,
      borderTopLeftRadius: theme.borderRadius.lg,
      borderTopRightRadius: theme.borderRadius.lg,
      paddingTop: theme.SH(20),
      paddingBottom: theme.SH(10),
      paddingHorizontal: theme.SW(20),
      marginHorizontal: theme.SW(10),
    },
    title: {
      fontSize: theme.fontSize.lg,
      color: theme.colors.text,
      fontFamily: theme.fonts.SEMI_BOLD,
      marginBottom: theme.SH(15),
      textAlign: 'center',
    },
    divider: {
      height: 0.5,
      backgroundColor: theme.colors.lightText || '#E0E0E0',
      marginVertical: theme.SH(8),
    },
    button: {
      paddingVertical: theme.SH(12),
    },
    lastButton: {
      marginBottom: theme.SH(8),
    },
    buttonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.SW(12),
    },
    buttonText: {
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      fontFamily: theme.fonts.MEDIUM,
    },
    cancelButtonContainer: {
      backgroundColor: theme.colors.white,
      paddingVertical: theme.SH(8),
      borderRadius: theme.borderRadius.lg,
      marginVertical: theme.SH(10),
      marginHorizontal: theme.SW(10),
      alignItems: 'center',
    },
    cancelButton: {
      borderRadius: theme.borderRadius.md,
    },
    cancelButtonText: {
      fontSize: theme.fontSize.md,
      fontFamily: theme.fonts.BOLD,
    },
  });

export default ImagePickerModal;
