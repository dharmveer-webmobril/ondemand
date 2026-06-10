import { View, StyleSheet, ScrollView } from 'react-native';
import React, { useMemo, useState, useCallback } from 'react';
import Container from '@components/common/Container';
import { AppHeader, CustomText, CustomButton } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { ServiceSummeryCard } from '@components';
import SCREEN_NAMES from '@navigation/ScreenNames';
import RoutineSessionsList, {
  toRoutineSessionListItems,
} from '@components/routine/RoutineSessionsList';
import { getProviderDisplayName } from '@utils/tools';
import { formatAmount } from '@utils/formatAmount';
import { getSelectedAddOnPricing } from '@screens/booking/checkoutHelpers';
import { useGuestGuard } from '@utils/hooks';
import { GuestLoginRequiredModal } from '@components';

type SelectedOffer = {
  serviceId: string;
  offerId: string;
  offer: any;
  discountAmount: number;
};

export default function BookingSummery() {
  const theme = useThemeContext();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { bookingData } = route.params ?? {};
  const {
    bookingType = 'single',
    date,
    timeSlot,
    sessions = [],
    sessionCount = 0,
    volumeDiscount,
    subtotalBeforeDiscount,
    providerData,
    selectedServices = [],
    totalPrice: bookingTotalPrice,
    totalDuration: bookingTotalDuration,
    promotionsDisabled = false,
  } = bookingData ?? {};

  const isRoutine = bookingType === 'routine';

  const [selectedOffers, setSelectedOffers] = useState<
    Record<string, SelectedOffer>
  >({});
  const {
    requireFullAccount,
    modalVisible,
    modalMessage,
    closeModal,
    goToLogin,
  } = useGuestGuard();

  const handleOfferChange = useCallback(
    (
      serviceId: string,
      offerId: string | null,
      discountAmount: number,
      offer?: any,
    ) => {
      if (isRoutine || promotionsDisabled) return;
      if (!offerId || !offer) {
        setSelectedOffers(prev => {
          const newOffers = { ...prev };
          delete newOffers[serviceId];
          return newOffers;
        });
        return;
      }
      setSelectedOffers(prev => ({
        ...prev,
        [serviceId]: {
          serviceId,
          offerId,
          offer,
          discountAmount,
        },
      }));
    },
    [isRoutine, promotionsDisabled],
  );

  const { totalPrice, totalDuration } = useMemo(() => {
    if (isRoutine) {
      const durationMatch = String(bookingTotalDuration || '').match(/(\d+)/);
      return {
        totalPrice: Number(bookingTotalPrice) || 0,
        totalDuration: durationMatch ? Number(durationMatch[1]) : 0,
      };
    }

    let price = 0;
    let duration = 0;

    selectedServices.forEach((service: any) => {
      const basePrice = service.price || 0;
      const selectedOffer = selectedOffers[service._id];
      const discountAmount = selectedOffer?.discountAmount || 0;
      const discountedServicePrice = basePrice - discountAmount;

      const addOnsPrice =
        service.selectedAddOns?.reduce((sum: number, addOn: any) => {
          if (!addOn) return sum;
          return sum + getSelectedAddOnPricing(addOn).lineTotal;
        }, 0) || 0;
      price += discountedServicePrice + addOnsPrice;

      const baseDuration = service.time || 0;
      const addOnsDuration =
        service.selectedAddOns?.reduce((sum: number, addOn: any) => {
          const qty = Math.max(1, Math.floor(Number(addOn?.quantity) || 1));
          return sum + (addOn.duration || 0) * qty;
        }, 0) || 0;
      duration += baseDuration + addOnsDuration;
    });

    return { totalPrice: price, totalDuration: duration };
  }, [
    isRoutine,
    selectedServices,
    selectedOffers,
    bookingTotalPrice,
    bookingTotalDuration,
  ]);

  const handleCheckout = useCallback(() => {
    if (
      !requireFullAccount(undefined, t('guest.bookingLoginMessage'))
    ) {
      return;
    }

    const updatedServices = isRoutine
      ? selectedServices
      : selectedServices.map((service: any) => {
          const selectedOffer = selectedOffers[service._id];
          if (selectedOffer) {
            return {
              ...service,
              appliedOffer: selectedOffer.offer,
              selectedOfferId: selectedOffer.offerId,
              discountAmount: selectedOffer.discountAmount,
            };
          }
          return service;
        });

    const updatedBookingData = {
      ...bookingData,
      selectedServices: updatedServices,
      totalPrice,
      totalDuration: `${totalDuration}m`,
    };

    navigation.navigate(SCREEN_NAMES.CHECKOUT, {
      bookingData: updatedBookingData,
    });
  }, [
    selectedServices,
    selectedOffers,
    bookingData,
    totalPrice,
    totalDuration,
    navigation,
    isRoutine,
    requireFullAccount,
    t,
  ]);
 
  return (
    <Container safeArea={true} style={styles.container}>
      <AppHeader
        title={t('bookingSummery.title')}
        onLeftPress={() => navigation.goBack()}
        backgroundColor="transparent"
        tintColor={theme.colors.text}
        containerStyle={{ marginHorizontal: theme.SW(20) }}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <CustomText style={styles.summaryName}>
                {getProviderDisplayName(providerData)}
              </CustomText>
              {providerData?.businessProfile?.formattedAddress && (
                <CustomText style={styles.summaryAddress}>
                  {providerData?.businessProfile?.formattedAddress}
                </CustomText>
              )}

              {isRoutine ? (
                <>
                  <CustomText style={styles.routineBadge}>
                    {t('bookAppointment.routinePackage')} · {sessionCount}{' '}
                    {t('bookAppointment.sessionsLabel')}
                  </CustomText>
                  {sessions.length > 0 ? (
                    <RoutineSessionsList
                      sessions={toRoutineSessionListItems(sessions)}
                      defaultCollapsed
                      maxScrollHeight={200}
                    />
                  ) : null}
                  {volumeDiscount ? (
                    <CustomText style={styles.volumeDiscountLine}>
                      {t('bookAppointment.volumeDiscount', {
                        tier: volumeDiscount.tier,
                        percent: volumeDiscount.percent,
                      })}{' '}
                      (−{formatAmount(Number(volumeDiscount.amount || 0))})
                    </CustomText>
                  ) : null}
                  {subtotalBeforeDiscount != null ? (
                    <CustomText style={styles.subtotalLine}>
                      {t('bookAppointment.subtotal')}: {formatAmount(Number(subtotalBeforeDiscount))}
                    </CustomText>
                  ) : null}
                </>
              ) : (
                <CustomText
                  style={styles.summeryDate}
                >{`${date} ${timeSlot}`}</CustomText>
              )}
            </View>
          </View>
        </View>

        <ServiceSummeryCard
          pageName={'booking-summery'}
          services={selectedServices}
          onRemoveService={() => {}}
          onAddAddOns={() => {}}
          onAddService={() => {}}
          onOfferChange={handleOfferChange}
          showPromotionalOffers={!isRoutine && !promotionsDisabled}
        />
      </ScrollView>

      <View style={styles.checkoutContainer}>
        <View style={styles.totalContainer}>
          <CustomText style={styles.totalLabel}>
            {t('bookingDetail.addOns.total')}
          </CustomText>
          <View style={styles.totalDetails}>
            <CustomText style={styles.totalPrice}>
              {formatAmount(Number.isFinite(totalPrice) ? totalPrice : 0)}
            </CustomText>
            <CustomText style={styles.totalDuration}>
              • {totalDuration}m
            </CustomText>
          </View>
        </View>
        <CustomButton
          title={t('bookingSummery.checkout')}
          onPress={handleCheckout}
          buttonStyle={styles.checkoutButton}
          backgroundColor={theme.colors.primary}
          textColor={theme.colors.white}
        />
      </View>

      <GuestLoginRequiredModal
        visible={modalVisible}
        message={modalMessage}
        onClose={closeModal}
        onLogin={goToLogin}
      />
    </Container>
  );
}
const createStyles = (theme: ThemeType) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.white,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      paddingVertical: theme.SH(20),
    },
    section: {
      paddingHorizontal: theme.SW(20),
      paddingVertical: theme.SH(20),
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.gray,
    },
    summaryCard: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.md,
      padding: theme.padding.md,
    },
    summaryRow: {
      justifyContent: 'space-between',
    },
    summaryName: {
      fontSize: theme.SF(16),
      fontFamily: theme.fonts.MEDIUM,
      color: theme.colors.text,
    },
    summaryAddress: {
      fontSize: theme.SF(12),
      fontFamily: theme.fonts.REGULAR,
      color: theme.colors.text,
      marginTop: theme.SH(3),
    },
    summeryDate: {
      fontSize: theme.SF(12),
      fontFamily: theme.fonts.REGULAR,
      color: theme.colors.text,
      marginTop: theme.SH(4),
    },
    routineBadge: {
      fontSize: theme.SF(13),
      fontFamily: theme.fonts.SEMI_BOLD,
      color: theme.colors.primary,
      marginTop: theme.SH(8),
    },
    volumeDiscountLine: {
      fontSize: theme.SF(12),
      fontFamily: theme.fonts.MEDIUM,
      color: '#2E7D32',
      marginTop: theme.SH(6),
    },
    subtotalLine: {
      fontSize: theme.SF(12),
      fontFamily: theme.fonts.REGULAR,
      color: theme.colors.lightText,
      marginTop: theme.SH(4),
    },
    checkoutContainer: {
      paddingHorizontal: theme.SW(20),
      paddingVertical: theme.SH(16),
      backgroundColor: theme.colors.white,
      borderTopWidth: 1,
      borderTopColor: theme.colors.gray,
      gap: theme.SH(12),
    },
    totalContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    totalLabel: {
      fontSize: theme.SF(16),
      fontFamily: theme.fonts.SEMI_BOLD,
      color: theme.colors.text,
    },
    totalDetails: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.SW(8),
    },
    totalPrice: {
      fontSize: theme.SF(18),
      fontFamily: theme.fonts.BOLD,
      color: theme.colors.primary,
    },
    totalDuration: {
      fontSize: theme.SF(14),
      fontFamily: theme.fonts.REGULAR,
      color: theme.colors.text,
    },
    checkoutButton: {
      width: '100%',
    },
  });
};
