import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import Divider from './Divider';
import { Fonts, requestCameraAccess } from '../utils';
import AppText from './AppText';
import { useTranslation } from 'react-i18next'; // Added for translation support

type Props = {
  visible: boolean;
  onClose: () => void;
  onImageSelected: (image: any) => void;
  types?: string;
};

const ImagePickerModal: React.FC<Props> = ({ visible, onClose, onImageSelected }) => {
  const { t } = useTranslation(); // Added translation hook
  const openCamera = async () => {
    const hasPermission = await requestCameraAccess();
    if (!hasPermission) return;

    try {
      const image = await ImagePicker.openCamera({
        width: 800,            // desired width
        height: 800,           // desired height
        compressImageMaxWidth: 800,
        compressImageMaxHeight: 800,
        compressImageQuality: 0.5, // from 0 (low) to 1 (original)
        cropping: true,
      });
      onImageSelected(image);
    } catch (error) {
      console.warn('Camera error:', error);
    } finally {
      onClose();
    }
  };

  const openGallery = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 800,            // desired width
        height: 800,           // desired height
        compressImageMaxWidth: 800,
        compressImageMaxHeight: 800,
        compressImageQuality: 0.5, // from 0 (low) to 1 (original)
        cropping: true,
      });
      onImageSelected(image);
    } catch (error) {
      console.warn('Gallery error:', error);
    } finally {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop}>
        <View style={styles.modalContent}>
          <AppText style={styles.title}>{t('imagePickerModal.title')}</AppText>
          <Divider height={0.5} color="#7F7F7F" />
          <TouchableOpacity style={styles.button} onPress={openCamera}>
            <AppText style={styles.buttonText}>{t('imagePickerModal.capture_image')}</AppText>
          </TouchableOpacity>
          <Divider height={0.5} color="#7F7F7F" />
          <TouchableOpacity
            style={[styles.button, { marginBottom: 8 }]}
            onPress={openGallery}
          >
            <AppText style={styles.buttonText}>{t('imagePickerModal.upload_from_gallery')}</AppText>
          </TouchableOpacity>
          <Divider height={0.5} color="#7F7F7F" />
        </View>
        <View style={styles.cancelButtonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <AppText style={styles.cancelText}>{t('imagePickerModal.cancel')}</AppText>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: '#fff',
    paddingTop: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  cancelButtonContainer: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  title: {
    fontSize: 12,
    fontFamily: Fonts.MEDIUM,
    marginBottom: 15,
    color: '#7F7F7F',
  },
  button: {
    paddingVertical: 12,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: Fonts.MEDIUM,
  },
  cancelButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    color: 'red',
    fontFamily: Fonts.MEDIUM,
  },
});

export default ImagePickerModal;