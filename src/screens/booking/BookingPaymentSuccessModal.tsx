import React, { useMemo } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText, CustomButton } from '@components/common';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getProviderDisplayName } from '@utils/tools';

/** Matches common “success” UI green (see booking-confirmed mockups). */
const SUCCESS_GREEN = '#58B78D';
const ROW_BORDER = '#E8EBEF';

export type BookingPaymentSuccessModalProps = {
  visible: boolean;
  confirmResponse: any | null;
  onContinueToBooking: () => void;
};

function formatMoneyAmount(
  amount: number | undefined,
  currency?: string | null,
): string {
  if (amount == null || !Number.isFinite(Number(amount))) return '';
  const n = Number(amount);
  const c = (currency || '').toUpperCase();
  if (c === 'USD') return `$${n.toFixed(2)}`;
  if (c === 'EUR') return `€${n.toFixed(2)}`;
  if (currency?.trim()) return `${currency} ${n.toFixed(2)}`;
  return String(n);
}

export default function BookingPaymentSuccessModal({
  visible,
  confirmResponse,
  onContinueToBooking,
}: BookingPaymentSuccessModalProps) {
  const theme = useThemeContext();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const data = confirmResponse?.ResponseData;
  const booking = data?.booking;
  const routineBooking = data?.routineBooking;
  const isRoutine = !!routineBooking;
  const transaction = data?.transaction;
  const paymentFlowKind = data?.paymentMethod;

  const providerName = getProviderDisplayName(
    {
      name:
        booking?.spName ??
        booking?.sp?.name ??
        (typeof booking?.spId === 'object' ? booking?.spId?.name : undefined),
      spBusinessProfile: booking?.spBusinessProfile,
    },
    '',
  );

  const routineTotalCents = routineBooking?.pricing?.totalCents;
  const amountDisplay = transaction
    ? formatMoneyAmount(transaction.amount, transaction.currency)
    : typeof booking?.discountedAmount === 'number'
    ? formatMoneyAmount(booking.discountedAmount, transaction?.currency)
    : routineTotalCents != null
    ? formatMoneyAmount(
        Number(routineTotalCents) / 100,
        routineBooking?.pricing?.currency ?? transaction?.currency,
      )
    : '';

  const gatewayLabel =
    transaction?.paymentGateway &&
    `${transaction.paymentGateway}${
      transaction.paymentMethod ? ` · ${transaction.paymentMethod}` : ''
    }`;

  const rows: { label: string; value: string }[] = [
    {
      label: t('checkout.paymentSuccessModal.bookingRef'),
      value: isRoutine
        ? routineBooking?.routineBookingId
          ? String(routineBooking.routineBookingId)
          : ''
        : booking?.bookingId
        ? String(booking.bookingId)
        : '',
    },
    {
      label: t('checkout.paymentSuccessModal.provider'),
      value: providerName,
    },
    {
      label: t('checkout.paymentSuccessModal.amount'),
      value: amountDisplay,
    },
    {
      label: t('checkout.paymentSuccessModal.bookingStatus'),
      value: isRoutine
        ? routineBooking?.routineStatus
          ? String(routineBooking.routineStatus)
          : ''
        : booking?.bookingStatus
        ? String(booking.bookingStatus)
        : '',
    },
    {
      label: t('checkout.paymentSuccessModal.paymentStatus'),
      value: isRoutine
        ? routineBooking?.paymentStatus
          ? String(routineBooking.paymentStatus)
          : ''
        : booking?.paymentStatus
        ? String(booking.paymentStatus)
        : '',
    },
    {
      label: t('checkout.paymentSuccessModal.transactionStatus'),
      value: transaction?.status ? String(transaction.status) : '',
    },
    {
      label: t('checkout.paymentSuccessModal.transactionId'),
      value: transaction?.transactionId
        ? String(transaction.transactionId)
        : '',
    },
    {
      label: t('checkout.paymentSuccessModal.gateway'),
      value: gatewayLabel || (paymentFlowKind ? String(paymentFlowKind) : ''),
    },
  ];

  const visibleRows = rows.filter(r => r.value?.trim());

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onContinueToBooking}
    >
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        <View style={styles.overlay}>
          <View style={styles.card}>
            <Pressable
              style={styles.closeFab}
              onPress={onContinueToBooking}
              hitSlop={14}
              accessibilityRole="button"
              accessibilityLabel={t('checkout.paymentSuccessModal.close')}
            >
              <View style={styles.closeFabInner}>
                <Ionicons name="close" size={theme.SW(22)} color="#5C6370" />
              </View>
            </Pressable>

            <View style={styles.hero}>
              <View style={styles.successBadge}>
                <Ionicons
                  name="checkmark"
                  size={theme.SW(36)}
                  color="#FFFFFF"
                />
              </View>
              <CustomText
                fontFamily={theme.fonts.BOLD}
                fontSize={theme.fontSize.xl}
                style={styles.confirmedHeading}
              >
                {t('checkout.paymentSuccessModal.confirmedHeading')}
              </CustomText>
              {(confirmResponse?.ResponseMessage || '').trim() ? (
                <CustomText
                  fontFamily={theme.fonts.REGULAR}
                  fontSize={theme.fontSize.sm}
                  color={theme.colors.gray || '#6B7280'}
                  style={styles.heroSubtext}
                  textAlign="center"
                >
                  {confirmResponse.ResponseMessage}
                </CustomText>
              ) : (
                <CustomText
                  fontFamily={theme.fonts.REGULAR}
                  fontSize={theme.fontSize.sm}
                  color={theme.colors.gray || '#6B7280'}
                  style={styles.heroSubtext}
                  textAlign="center"
                >
                  {t('checkout.paymentSuccessModal.subtitle')}
                </CustomText>
              )}
            </View>

            <View style={styles.detailsWrap}>
              <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                bounces={false}
              >
                {visibleRows.map((row, idx) => (
                  <View
                    key={`${row.label}-${idx}`}
                    style={[
                      styles.detailRow,
                      idx === visibleRows.length - 1 && styles.detailRowLast,
                    ]}
                  >
                    <CustomText style={styles.detailLabel} numberOfLines={3}>
                      {row.label}
                    </CustomText>
                    <CustomText style={styles.detailValue} numberOfLines={4}>
                      {row.value}
                    </CustomText>
                  </View>
                ))}
              </ScrollView>
            </View>

            <CustomButton
              title={t('checkout.paymentSuccessModal.viewBooking')}
              onPress={onContinueToBooking}
              backgroundColor={SUCCESS_GREEN}
              textColor="#FFFFFF"
              marginTop={theme.SH(8)}
              buttonStyle={styles.cta}
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const createStyles = (theme: ThemeType) => {
  const { SW, SH, SF } = theme;
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(17, 24, 39, 0.55)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: SW(20),
      paddingVertical: SH(24),
      paddingTop: Platform.OS === 'ios' ? SH(48) : SH(28),
    },
    card: {
      width: '100%',
      maxWidth: SW(380),
      maxHeight: '90%',
      backgroundColor: '#FFFFFF',
      borderRadius: SF(20),
      paddingHorizontal: SW(20),
      paddingTop: SH(28),
      paddingBottom: SH(22),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.18,
      shadowRadius: 24,
      elevation: 12,
    },
    closeFab: {
      position: 'absolute',
      top: SH(12),
      right: SW(12),
      zIndex: 10,
    },
    closeFabInner: {
      width: SW(36),
      height: SW(36),
      borderRadius: SW(18),
      backgroundColor: '#F3F4F6',
      alignItems: 'center',
      justifyContent: 'center',
    },
    hero: {
      alignItems: 'center',
      paddingHorizontal: SW(8),
      paddingBottom: SH(16),
    },
    successBadge: {
      width: SW(88),
      height: SW(88),
      borderRadius: SW(44),
      backgroundColor: SUCCESS_GREEN,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: SH(16),
      shadowColor: SUCCESS_GREEN,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 6,
    },
    confirmedHeading: {
      color: SUCCESS_GREEN,
      textAlign: 'center',
      letterSpacing: -0.3,
    },
    heroSubtext: {
      marginTop: SH(8),
      lineHeight: theme.fontSize.sm * 1.45,
      paddingHorizontal: SW(4),
    },
    detailsWrap: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: ROW_BORDER,
      borderRadius: SF(12),
      overflow: 'hidden',
      backgroundColor: '#FAFBFC',
    },
    scroll: {
      maxHeight: SH(280),
    },
    scrollContent: {
      paddingBottom: SH(2),
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: SH(14),
      paddingHorizontal: SW(14),
      gap: SW(16),
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: ROW_BORDER,
      backgroundColor: '#FFFFFF',
      minHeight: SH(48),
    },
    detailRowLast: {
      borderBottomWidth: 0,
    },
    detailLabel: {
      flex: 1,
      flexShrink: 1,
      fontSize: theme.fontSize.sm,
      fontFamily: theme.fonts.MEDIUM,
      color: '#6B7280',
    },
    detailValue: {
      flex: 1,
      fontSize: theme.fontSize.sm,
      fontFamily: theme.fonts.SEMI_BOLD,
      color: '#111827',
      textAlign: 'right',
    },
    cta: {
      borderRadius: SF(14),
      paddingVertical: SH(4),
    },
  });
};
