

import React, { useState } from 'react';
import { Modal, View, TextInput, StyleSheet } from 'react-native';
import { Colors, Fonts, SF, SH, SW } from '../../utils';
import StarRating from 'react-native-star-rating-widget';
import AppText from '../AppText';
import Buttons from '../Button';
import { useTranslation } from 'react-i18next';

interface SubmitRatingReviewModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, review: string) => void;
  btnLoading?: boolean;
  title?: string;
  submitButtonText?: string; // Added to support localized prop from BookingDetails
}

const SubmitRatingReviewModal: React.FC<SubmitRatingReviewModalProps> = ({
  visible,
  onClose,
  onSubmit,
  btnLoading,
  title,
  submitButtonText,
}) => {
  const { t } = useTranslation(); // Initialize translation hook
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  const handleSubmit = () => {
    if (rating > 0) {
      onSubmit(rating, review.trim());
      setRating(0);
      setReview('');
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <AppText style={styles.modalTitle}>
            {title || t('bookingDetails.modal.defaultTitle')}
          </AppText>
          <View style={styles.starRatingContainer}>
            <StarRating
              rating={rating}
              onChange={setRating}
              starSize={SF(30)}
              enableHalfStar={false}
              starStyle={styles.star}
              color={Colors.themeColor}
              emptyColor={Colors.lightGray}
            />
            <AppText style={styles.ratingText}>
              {t('bookingDetails.modal.ratingText', { rating })}
            </AppText>
          </View>
          <TextInput
            style={styles.reviewInput}
            placeholder={t('bookingDetails.modal.reviewPlaceholder')}
            placeholderTextColor={Colors.lightGraytext}
            value={review}
            onChangeText={setReview}
            multiline={true}
            numberOfLines={4}
          />
          <View style={styles.buttonContainer}>
            <Buttons
              title={t('bookingDetails.modal.cancelButton')}
              buttonStyle={styles.cancelButton}
              textColor={Colors.textAppColor}
              onPress={onClose}
            />
            <Buttons
              title={submitButtonText || t('bookingDetails.modal.submitButton')}
              isLoading={btnLoading}
              buttonStyle={styles.submitButton}
              textColor={Colors.textWhite}
              onPress={handleSubmit}
              disable={rating === 0}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default SubmitRatingReviewModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: Colors.bgwhite,
    borderRadius: SF(10),
    padding: SH(20),
    alignItems: 'center',
  },
  modalTitle: {
    fontFamily: Fonts.SEMI_BOLD,
    fontSize: SF(18),
    color: Colors.textAppColor,
    marginBottom: SH(15),
  },
  starRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SH(20),
  },
  star: {
    marginHorizontal: SW(2),
  },
  ratingText: {
    fontFamily: Fonts.MEDIUM,
    fontSize: SF(14),
    color: Colors.textAppColor,
    marginLeft: SW(10),
  },
  reviewInput: {
    width: '100%',
    height: SH(100),
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: SF(5),
    padding: SH(10),
    fontFamily: Fonts.REGULAR,
    fontSize: SF(14),
    color: Colors.textAppColor,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: SH(20),
  },
  cancelButton: {
    backgroundColor: Colors.lightGray,
    width: '48%',
    borderRadius: SF(5),
  },
  submitButton: {
    backgroundColor: Colors.themeColor,
    width: '48%',
    borderRadius: SF(5),
  },
});