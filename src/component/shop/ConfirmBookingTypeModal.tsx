import React, { useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Colors, Fonts, SF, SH, SW } from '../../utils';
import { AppText, Buttons, Checkbox, DropdownComponent, Spacing, VectoreIcons } from '../../component';
import { useTranslation } from 'react-i18next';

type ConfirmBookingTypeModalProps = {
  modalVisible: boolean;
  closeModal: () => void;
  brnSubmit: (value: any) => void;
};

const ConfirmBookingTypeModal: React.FC<ConfirmBookingTypeModalProps> = ({
  modalVisible = true,
  closeModal,
  brnSubmit,
}) => {
  const { t } = useTranslation(); // Initialize translation hook
  const [checkServiceType, setCheckServiceType] = useState('current');

  const btnCheckServiceType = (type: string) => {
    if (type === checkServiceType) return;
    if (type === 'current' || type === 'routine') setCheckServiceType(type);
  };

  // Localized dropdown data
  const data = [
    { label: t('shopDetails.modal.routineOptions.monthly'), value: '1' },
    { label: t('shopDetails.modal.routineOptions.quarterly'), value: '2' },
    { label: t('shopDetails.modal.routineOptions.sixMonth'), value: '3' },
    { label: t('shopDetails.modal.routineOptions.yearly'), value: '4' },
  ];

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={closeModal}
    >
      <View style={styles.modalView}>
        <View style={styles.mainView}>
          <TouchableOpacity onPress={closeModal} style={styles.crossIcon}>
            <VectoreIcons
              icon="Ionicons"
              name="close"
              color={Colors.themeColor}
              size={SF(28)}
            />
          </TouchableOpacity>

          <AppText style={styles.heading}>{t('shopDetails.modal.confirmBooking')}</AppText>

          <Checkbox
            checked={checkServiceType === 'current'}
            size={SF(18)}
            color={'#404040'}
            lebelFontSize={SF(14)}
            onChange={() => btnCheckServiceType('current')}
            label={t('shopDetails.modal.currentBooking')}
          />
          <Spacing />

          <Checkbox
            checked={checkServiceType === 'routine'}
            size={SF(18)}
            color={'#404040'}
            lebelFontSize={SF(14)}
            onChange={() => btnCheckServiceType('routine')}
            label={t('shopDetails.modal.routineBooking')}
          />

          <DropdownComponent
            isDisable={checkServiceType === 'current'}
            placeholderText={t('shopDetails.modal.routineOptions.placeholder')}
            selectedvalue={t('shopDetails.modal.routineOptions.monthly')}
            dropdown={styles.dropdownStyle}
            selectedTextStyle={styles.dropdownSelectedText}
            placeholderStyle={styles.dropdownPlaceholderText}
            data={data}
          />

          <Buttons
            onPress={() => brnSubmit(checkServiceType)}
            title={t('shopDetails.modal.confirm')}
          />

          <Spacing space={SH(8)} />
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmBookingTypeModal;

const styles = StyleSheet.create({
  modalView: {
    flex: 1,
    backgroundColor: '#00000050',
    justifyContent: 'flex-end',
  },
  mainView: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: SF(10),
    borderTopRightRadius: SF(10),
    paddingHorizontal: SF(25),
    paddingBottom: SW(20),
  },
  heading: {
    color: Colors.textHeader,
    fontFamily: Fonts.SEMI_BOLD,
    fontSize: SF(20),
    textAlign: 'center',
    marginTop: SH(22),
    marginBottom: SH(20),
  },
  crossIcon: {
    position: 'absolute',
    right: 4,
    top: 4,
    padding: 5,
    zIndex: 99999,
  },
  dropdownStyle: {
    backgroundColor: '#F2F2F2',
    paddingHorizontal: SF(25),
    paddingVertical: 15,
    borderWidth: 0,
    marginTop: SH(20),
    marginBottom: SH(90),
  },
  dropdownSelectedText: {
    color: Colors.textAppColor,
  },
  dropdownPlaceholderText: {
    color: Colors.textAppColor,
  },
});