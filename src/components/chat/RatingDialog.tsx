import { View, StyleSheet, Modal, TextInput, Pressable } from 'react-native'
import React, { useState, useMemo } from 'react'
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText } from '@components/common';
import { useTranslation } from 'react-i18next';
import StarRating from 'react-native-star-rating-widget';

interface RatingDialogProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, review: string) => void;
}

export default function RatingDialog({ visible, onClose, onSubmit }: RatingDialogProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  const handleSubmit = () => {
    if (rating > 0) {
      onSubmit(rating, review);
      setRating(0);
      setReview('');
      onClose();
    }
  };

  return (
    <Modal
      transparent
      visible={visible} statusBarTranslucent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <CustomText style={styles.title}>{t('chat.rateClient')}</CustomText>
          
          <View style={styles.ratingContainer}>
            <StarRating
              rating={rating}
              onChange={setRating}
              starSize={theme.SF(40)}
              color="#FFC107"
              starStyle={styles.star}
            />
          </View>

          <TextInput
            style={styles.reviewInput}
            placeholder={t('chat.typeYourReviews')}
            placeholderTextColor={theme.colors.lightText}
            value={review}
            onChangeText={setReview}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <Pressable
            style={[styles.submitButton, rating === 0 && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={rating === 0}
          >
            <CustomText style={styles.submitButtonText}>{t('chat.submit')}</CustomText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: ThemeType) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.SW(20),
  },
  dialog: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.padding.lg,
    width: '100%',
    maxWidth: theme.SW(400),
  },
  title: {
    fontSize: theme.fontSize.xl,
    color: theme.colors.text,
    fontFamily: theme.fonts.BOLD,
    marginBottom: theme.SH(20),
    textAlign: 'center',
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: theme.SH(20),
  },
  star: {
    marginHorizontal: theme.SW(4),
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: theme.colors.secondary || '#EAEAEA',
    borderRadius: theme.borderRadius.md,
    padding: theme.padding.md,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontFamily: theme.fonts.MEDIUM,
    minHeight: theme.SH(100),
    marginBottom: theme.SH(20),
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.SH(12),
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: theme.colors.lightText,
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.white,
    fontFamily: theme.fonts.BOLD,
  },
});

