import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {
  CustomText,
  CustomButton,
  CustomInput,
  VectoreIcons,
  KeyboardModalAvoiding,
  Checkbox,
} from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGetCancellationRefundPolicy } from '@services/api/queries/appQueries';

type CancelBookingModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  isLoading?: boolean;
  title?: string;
  /** When true, loads policy summary and requires acceptance checkbox */
  showRefundPolicy?: boolean;
  variant?: 'booking' | 'service';
  onPolicyLinkPress?: () => void;
};

export default function CancelBookingModal({
  visible,
  onClose,
  onSubmit,
  isLoading = false,
  title,
  showRefundPolicy = true,
  variant = 'booking',
  onPolicyLinkPress,
}: CancelBookingModalProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [policyAccepted, setPolicyAccepted] = useState(false);

  const { data: policyRes, isLoading: policyLoading } =
    useGetCancellationRefundPolicy(visible && showRefundPolicy);

  const policy = policyRes?.succeeded ? policyRes.ResponseData : null;
  const hours = policy?.closeWindowHours ?? 24;
  const fullPercent = policy?.fullRefundPercent ?? 60;
  const shortPercent = policy?.shortRefundPercent ?? 10;

  const resolvedTitle =
    title ??
    (variant === 'service'
      ? t('bookingDetails.cancelService')
      : t('bookingDetails.cancelBookingTitle'));

  const warningText =
    variant === 'service'
      ? t('bookingDetails.cancelServiceWarning')
      : t('bookingDetails.cancelBookingWarning');

  const requiresPolicyAcceptance = showRefundPolicy;
  const canConfirm =
    reason.trim().length > 0 &&
    (!requiresPolicyAcceptance || policyAccepted);

  useEffect(() => {
    if (!visible) {
      setReason('');
      setPolicyAccepted(false);
    }
  }, [visible]);

  const handleSubmit = useCallback(() => {
    if (canConfirm) {
      onSubmit(reason.trim());
    }
  }, [canConfirm, reason, onSubmit]);

  const handleClose = useCallback(() => {
    if (!isLoading) {
      setReason('');
      setPolicyAccepted(false);
      onClose();
    }
  }, [onClose, isLoading]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <KeyboardModalAvoiding style={styles.flex}>
          <View style={styles.sheet}>
            <View style={styles.header}>
              <CustomText
                fontSize={theme.fontSize.lg}
                fontFamily={theme.fonts.SEMI_BOLD}
                color={theme.colors.text}
              >
                {resolvedTitle}
              </CustomText>
              <Pressable
                onPress={handleClose}
                style={styles.closeButton}
                disabled={isLoading}
                hitSlop={12}
              >
                <VectoreIcons
                  name="close"
                  icon="Ionicons"
                  size={theme.SF(24)}
                  color={theme.colors.text}
                />
              </Pressable>
            </View>

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {!showRefundPolicy ? (
                <View style={styles.warningBox}>
                  <VectoreIcons
                    name="warning"
                    icon="Ionicons"
                    size={theme.SF(22)}
                    color="#B45309"
                  />
                  <CustomText
                    fontSize={theme.fontSize.sm}
                    fontFamily={theme.fonts.MEDIUM}
                    color="#92400E"
                    style={styles.warningText}
                  >
                    {warningText}
                  </CustomText>
                </View>
              ) : null}

              {showRefundPolicy ? (
                policyLoading ? (
                  <View style={styles.policyLoading}>
                    <ActivityIndicator color={theme.colors.primary} />
                  </View>
                ) : (
                  <View style={styles.policyBox}>
                    <CustomText
                      fontSize={theme.fontSize.md}
                      fontFamily={theme.fonts.SEMI_BOLD}
                      color={theme.colors.text}
                      style={styles.policyHeading}
                    >
                      {t('bookingDetails.cancellationPolicyHeading')}
                    </CustomText>
                    <CustomText
                      fontSize={theme.fontSize.sm}
                      fontFamily={theme.fonts.REGULAR}
                      color={theme.colors.text}
                      style={styles.policyIntro}
                    >
                      {t('bookingDetails.cancellationPolicyIntro')}
                    </CustomText>
                    <View style={styles.bulletRow}>
                      <CustomText style={styles.bullet}>•</CustomText>
                      <CustomText
                        fontSize={theme.fontSize.sm}
                        fontFamily={theme.fonts.REGULAR}
                        color={theme.colors.text}
                        style={styles.bulletText}
                      >
                        {t('bookingDetails.refundPolicyFullPrefix', { hours })}
                        <CustomText fontFamily={theme.fonts.SEMI_BOLD}>
                          {fullPercent}%
                        </CustomText>
                        {t('bookingDetails.refundPolicyRefundSuffix')}
                      </CustomText>
                    </View>
                    <View style={styles.bulletRow}>
                      <CustomText style={styles.bullet}>•</CustomText>
                      <CustomText
                        fontSize={theme.fontSize.sm}
                        fontFamily={theme.fonts.REGULAR}
                        color={theme.colors.text}
                        style={styles.bulletText}
                      >
                        {t('bookingDetails.refundPolicyShortPrefix', { hours })}
                        <CustomText fontFamily={theme.fonts.SEMI_BOLD}>
                          {shortPercent}%
                        </CustomText>
                        {t('bookingDetails.refundPolicyShortSuffix')}
                      </CustomText>
                    </View>
                  </View>
                )
              ) : null}

              

              <CustomText
                fontSize={theme.fontSize.sm}
                fontFamily={theme.fonts.MEDIUM}
                color={theme.colors.text}
                style={styles.reasonLabel}
              >
                {t('bookingDetails.cancellationReasonLabel')}
              </CustomText>
              <CustomInput
                placeholder={t('bookingDetails.cancelBookingPlaceholder')}
                value={reason}
                onChangeText={setReason}
                multiline
                numberOfLines={5}
                maxLength={500}
                inputTheme="default"
                withBackground={theme.colors.secondary}
                isEditable={!isLoading}
              />
              {showRefundPolicy && !policyLoading ? (
                <View style={styles.acceptRow}>
                  <Checkbox
                    checked={policyAccepted}
                    onChange={() => setPolicyAccepted(prev => !prev)}
                    size={20}
                  />
                  {/* <View style={styles.acceptLabelWrap}> */}
                    <CustomText
                      fontSize={theme.fontSize.sm}
                      fontFamily={theme.fonts.REGULAR}
                      color={theme.colors.text}
                    >
                      {t('bookingDetails.acceptCancellationPolicyPrefix')}{' '}
                    </CustomText>
                    <Pressable
                      onPress={onPolicyLinkPress}
                      hitSlop={8}
                      disabled={!onPolicyLinkPress}
                    >
                      <CustomText
                        fontSize={theme.fontSize.sm}
                        fontFamily={theme.fonts.REGULAR}
                        color={theme.colors.primary}
                        style={styles.policyLink}
                      >
                        {t('bookingDetails.cancellationPolicyLink')}
                      </CustomText>
                    </Pressable>
                  {/* </View> */}
                </View>
              ) : null}
            </ScrollView>

            <View
              style={[
                styles.footer,
                { paddingBottom: Math.max(insets.bottom, theme.SH(12)) },
              ]}
            >
              <CustomButton
                title={t('bookingDetails.confirmCancellation')}
                onPress={handleSubmit}
                backgroundColor={
                  !canConfirm || isLoading
                    ? theme.colors.gray || '#9CA3AF'
                    : theme.colors.red || '#F44336'
                }
                textColor={theme.colors.white}
                buttonStyle={styles.footerConfirmBtn}
                disable={!canConfirm || isLoading}
                isLoading={isLoading}
              />
            </View>
          </View>
        </KeyboardModalAvoiding>
      </SafeAreaView>
    </Modal>
  );
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
    },
    flex: {
      flex: 1,
    },
    sheet: {
      flex: 1,
      marginTop: theme.SH(8),
      backgroundColor: theme.colors.white,
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.SW(20),
      paddingVertical: theme.SH(16),
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.gray || '#E5E7EB',
    },
    closeButton: {
      width: theme.SF(36),
      height: theme.SF(36),
      borderRadius: theme.SF(18),
      backgroundColor: theme.colors.secondary || '#F3F4F6',
      justifyContent: 'center',
      alignItems: 'center',
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: theme.SW(20),
      paddingTop: theme.SH(16),
      paddingBottom: theme.SH(24),
    },
    warningBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.SW(10),
      backgroundColor: '#FEF3C7',
      borderWidth: 1,
      borderColor: '#FDE68A',
      borderRadius: theme.borderRadius.md,
      padding: theme.SW(14),
      marginBottom: theme.SH(14),
    },
    warningText: {
      flex: 1,
      lineHeight: theme.SH(20),
    },
    policyLoading: {
      paddingVertical: theme.SH(24),
      alignItems: 'center',
      marginBottom: theme.SH(14),
    },
    policyBox: {
      backgroundColor: '#EFF6FF',
      borderWidth: 1,
      borderColor: '#BFDBFE',
      borderRadius: theme.borderRadius.md,
      padding: theme.SW(14),
      marginBottom: theme.SH(14),
    },
    policyHeading: {
      marginBottom: theme.SH(8),
    },
    policyIntro: {
      lineHeight: theme.SH(20),
      marginBottom: theme.SH(10),
    },
    bulletRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.SW(8),
      marginBottom: theme.SH(6),
    },
    bullet: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.text,
      lineHeight: theme.SH(20),
    },
    bulletText: {
      flex: 1,
      lineHeight: theme.SH(20),
    },
    acceptRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: theme.SH(16),
      paddingRight: theme.SW(8),
      marginTop: theme.SH(20),
    },
    acceptLabelWrap: {
      flex: 1,
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      // marginTop: theme.SH(2),
    },
    policyLink: {
      textDecorationLine: 'underline',
    },
    reasonLabel: {
      marginBottom: theme.SH(8),
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingHorizontal: theme.SW(20),
      paddingTop: theme.SH(12),
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.gray || '#E5E7EB',
      backgroundColor: theme.colors.white,
    },
    footerConfirmBtn: {
      borderRadius: theme.borderRadius.md,
      minWidth: theme.SW(180),
    },
  });
