import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Colors, Fonts, getPriceDetails, SF, SH, SW } from '../../utils';
import { AppText, Buttons, Checkbox, ServiceItem, Spacing, VectoreIcons } from '../../component';
import BookingServiceItem from './BookingServiceItem';
import { useTranslation } from 'react-i18next';

type ConfirmBookingModalProps = {
  modalVisible: boolean;
  forwhomCheck?: boolean;
  setForwhomCheck?: () => void;
  closeModal: () => void;
  btnSubmit: () => void;
  selectedDate?: string;
  service?: any;
  selectedSlot?: any;
  shopName?: string;
  shopAddress?: string;
  agentName?: string;
};

const ConfirmBookingModal: React.FC<ConfirmBookingModalProps> = ({
  modalVisible = true,
  closeModal,
  forwhomCheck = false,
  setForwhomCheck,
  btnSubmit,
  selectedDate,
  service,
  selectedSlot,
  shopName = '',
  shopAddress = '',
  agentName = '',
}) => {
    
  const { t } = useTranslation(); // Initialize translation hook
  const { displayPrice } = getPriceDetails(service);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => closeModal()}
    >
      <View style={styles.modalView}>
        <View style={styles.mainView}>
          <TouchableOpacity onPress={() => closeModal()} style={styles.crossIcon}>
            <VectoreIcons
              icon="Ionicons"
              name="close"
              color={Colors.themeColor}
              size={SF(30)}
            />
          </TouchableOpacity>
          <Spacing space={SH(20)} />
          <AppText style={styles.heading}>{t('bookAppointment.modal.confirmBooking')}</AppText>
          <Spacing space={SH(20)} />
          <AppText style={styles.dateorshopbame}>{selectedDate}</AppText>
          <AppText style={styles.dateorshopbame}>{shopName}</AppText>
          <AppText style={styles.shopaddress}>{shopAddress}</AppText>
          <Spacing space={SH(20)} />
          <ServiceItem
            type="modal-view"
            subtitles={t('bookAppointment.modal.withAgent', { agentName })}
            time={(selectedSlot?.end && selectedSlot?.start && `${selectedSlot.start}-${selectedSlot.end}`) || ''}
            title={service?.serviceName || ''}
            price={`$${service?.price || ''}`}
            item={service}
          />
          <Spacing space={SH(8)} />
          <BookingServiceItem
            title={t('bookAppointment.modal.subtotal')}
            price={`${displayPrice || ''}`}
          />
          <View style={{ marginTop: 10, marginLeft: 2 }}>
            <Checkbox
              size={SF(14)}
              lebelFontSize={SF(14)}
              color={Colors.themeColor}
              label={t('bookAppointment.modal.forWhomLabel')}
              checked={forwhomCheck}
              onChange={() => setForwhomCheck && setForwhomCheck()}
            />
          </View>
          <Spacing space={SH(70)} />
          <Buttons
            onPress={() => btnSubmit()}
            title={t('bookAppointment.modal.confirm')}
          />
          <Spacing space={SH(8)} />
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmBookingModal;

const styles = StyleSheet.create({
  modalView: {
    flex: 1,
    backgroundColor: '#00000050',
    justifyContent: 'flex-end',
  },
  mainView: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: SW(10),
    borderTopRightRadius: SW(10),
    paddingHorizontal: SW(25),
    paddingBottom: SW(20),
  },
  heading: {
    color: Colors.textHeader,
    fontFamily: Fonts.SEMI_BOLD,
    fontSize: SF(20),
    textAlign: 'center',
  },
  dateorshopbame: {
    color: Colors.textAppColor,
    fontFamily: Fonts.MEDIUM,
    fontSize: SF(14),
    marginTop: SH(2.5),
  },
  shopaddress: {
    color: Colors.lightGraytext,
    fontFamily: Fonts.MEDIUM,
    fontSize: SF(12),
    marginTop: SH(2.5),
  },
  crossIcon: {
    position: 'absolute',
    right: 4,
    top: 4,
    padding: 5,
    zIndex: 99999,
  },
});