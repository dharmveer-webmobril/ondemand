import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useMemo, useState, useCallback, useEffect } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import {
  AppHeader,
  CustomText,
  CustomButton,
  showToast,
  SweetAlert,
} from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';
import { useGetServiceProviderServices } from '@services/index';
import ServiceSelectionModal from '@components/provider/ServiceSelectionModal';
import AddOnSelectionModal from '@components/provider/AddOnSelectionModal';
import ServiceCart from '@components/provider/ServiceCart';
import BookAppointmentDateTimeModal from '@components/provider/BookAppointmentDateTimeModal';
import BookAppointmentPreferenceRow from '@components/provider/BookAppointmentPreferenceRow';
import BookAppointmentBookingTypeSelector, {
  type BookingType,
} from '@components/provider/BookAppointmentBookingTypeSelector';
import RoutineHowItWorksSection from '@components/provider/RoutineHowItWorksSection';
import VolumeDiscountTiersSection from '@components/provider/VolumeDiscountTiersSection';
import BookAppointmentSessionSection from '@components/provider/BookAppointmentSessionSection';
import RoutinePackageSummaryCard from '@components/provider/RoutinePackageSummaryCard';
import SCREEN_NAMES from '@navigation/ScreenNames';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatAmount } from '@utils/formatAmount';
import {
  ROUTINE_MIN_SESSIONS,
  ROUTINE_MAX_DAYS_AHEAD,
  ROUTINE_ADVANCE_HOURS,
  type RoutineSession,
  getVolumeDiscountForSessionCount,
  applyVolumeDiscount,
  addDaysToDateString,
  formatDateDisplay,
} from '@utils/routineVolumeDiscount';
import {
  isCartRoutineEligible,
  isServiceRoutineEnabled,
  getAggregatedRoutineLimits,
  getDiscountTiersForServices,
  getRoutineMinDateString,
  getRoutineAdvanceNoticeMs,
  shouldRestrictServicePickerToRoutine,
  serviceSupportsDeliveryPreference,
  catalogOffersRoutineBooking,
  getNonRoutineServicesInCart,
} from '@utils/serviceRoutineConfig';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const formatDateToString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getSessionDateTime = (date: string, time: string): Date | null => {
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  if (
    !year ||
    !month ||
    !day ||
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes)
  ) {
    return null;
  }
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
};

const isAfterRoutineAdvanceWindow = (
  date: string,
  time: string,
  advanceNoticeMs: number,
) => {
  const sessionDateTime = getSessionDateTime(date, time);
  if (!sessionDateTime) return false;
  return sessionDateTime.getTime() >= Date.now() + advanceNoticeMs;
};

const getEntityId = (value: any): string => {
  if (typeof value === 'string') return value;
  return value?._id || value?.id || '';
};

const reconcileSelectedServicesWithCatalog = (
  selected: any[],
  catalog: any[],
) => {
  if (!Array.isArray(selected) || !Array.isArray(catalog)) return [];

  const catalogById = new Map<string, any>();
  catalog.forEach((service: any) => {
    const serviceId = getEntityId(service);
    if (serviceId) {
      catalogById.set(serviceId, service);
    }
  });

  return selected
    .map((selectedService: any) => {
      const catalogService = catalogById.get(getEntityId(selectedService));
      if (!catalogService) return null;

      const selectedAddOnIds = new Set(
        (selectedService?.selectedAddOns || []).map(getEntityId).filter(Boolean),
      );
      const selectedAddOns = (catalogService?.serviceAddOns || []).filter(
        (addOn: any) => selectedAddOnIds.has(getEntityId(addOn)),
      );

      return {
        ...catalogService,
        selectedAddOns,
      };
    })
    .filter(Boolean);
};

export default function BookAppointment() {
  const theme = useThemeContext();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { bookingDetails, providerId, selectedServices, providerData } =
    route?.params ?? {};

  const {
    data: servicesData,
    isLoading: isLoadingServices,
  } = useGetServiceProviderServices(providerId, bookingDetails?.deliveryMode);

  const services = useMemo(() => {
    const catalog: any[] = servicesData?.ResponseData?.services || [];
    return catalog;
  }, [servicesData]);

  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);
  const todayString = useMemo(() => formatDateToString(today), [today]);
  const routineMaxDate = useMemo(
    () => addDaysToDateString(todayString, ROUTINE_MAX_DAYS_AHEAD),
    [todayString],
  );

  const [bookingType, setBookingType] = useState<BookingType>('single');
  const [showDateTimeModal, setShowDateTimeModal] = useState(false);
  const [showRoutineHowItWorks, setShowRoutineHowItWorks] = useState(false);
  const [showVolumeTiers, setShowVolumeTiers] = useState(false);

  const [selectedDateString, setSelectedDateString] =
    useState<string>(todayString);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [routineSessions, setRoutineSessions] = useState<RoutineSession[]>([]);

  const [currentSelectedServices, setCurrentSelectedServices] = useState<any[]>(
    [],
  );
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showSwitchToRoutineAlert, setShowSwitchToRoutineAlert] = useState(false);
  const [nonRoutineNamesForAlert, setNonRoutineNamesForAlert] = useState('');
  const [showAddOnModal, setShowAddOnModal] = useState(false);
  const [selectedServiceForAddOns, setSelectedServiceForAddOns] =
    useState<any>(null);

  const routineEligible = useMemo(
    () => isCartRoutineEligible(currentSelectedServices),
    [currentSelectedServices],
  );

  const routineLimits = useMemo(
    () => getAggregatedRoutineLimits(currentSelectedServices),
    [currentSelectedServices],
  );

  const discountTiers = useMemo(
    () => getDiscountTiersForServices(currentSelectedServices),
    [currentSelectedServices],
  );

  const routineMinDate = useMemo(
    () => getRoutineMinDateString(todayString, currentSelectedServices),
    [todayString, currentSelectedServices],
  );

  const routineAdvanceNoticeMs = useMemo(
    () => getRoutineAdvanceNoticeMs(currentSelectedServices),
    [currentSelectedServices],
  );
  const routineAdvanceNoticeHours = useMemo(
    () =>
      Math.max(
        ROUTINE_ADVANCE_HOURS,
        Math.ceil(routineAdvanceNoticeMs / (60 * 60 * 1000)),
      ),
    [routineAdvanceNoticeMs],
  );

  const maxRoutineSessions = routineLimits.maxSessions;

  const deliveryMode = bookingDetails?.deliveryMode ?? '';

  useEffect(() => {
    if (isLoadingServices) return;

    const initialSelected: any[] = Array.isArray(selectedServices)
      ? selectedServices
      : [];
    setCurrentSelectedServices(
      reconcileSelectedServicesWithCatalog(initialSelected, services),
    );
  }, [isLoadingServices, selectedServices, services]);

  const restrictServicePickerToRoutine = useMemo(
    () =>
      shouldRestrictServicePickerToRoutine({
        bookingType,
        routineSessionCount: routineSessions.length,
      }),
    [bookingType, routineSessions.length],
  );

  const showBookingTypeTabs = useMemo(
    () => catalogOffersRoutineBooking(services, deliveryMode),
    [services, deliveryMode],
  );

  useEffect(() => {
    if (!routineEligible && bookingType === 'routine') {
      setBookingType('single');
      setRoutineSessions([]);
      setShowVolumeTiers(false);
      setShowRoutineHowItWorks(false);
    }
  }, [routineEligible, bookingType]);

  const applySwitchToRoutine = useCallback(() => {
    const routineOnly = currentSelectedServices.filter((s: any) =>
      isServiceRoutineEnabled(s),
    );
    if (routineOnly.length === 0) {
      showToast({
        type: 'error',
        message: t('bookAppointment.noRoutineServicesAfterSwitch'),
      });
      return;
    }
    setCurrentSelectedServices(routineOnly);
    setBookingType('routine');
    setShowVolumeTiers(false);
    setShowRoutineHowItWorks(false);
    setRoutineSessions([]);
  }, [currentSelectedServices, t]);

  const handleBookingTypeChange = useCallback(
    (type: BookingType) => {
      if (type === 'single') {
        setBookingType('single');
        setShowVolumeTiers(false);
        setShowRoutineHowItWorks(false);
        setRoutineSessions([]);
        return;
      }

      if (type === 'routine') {
        const nonRoutine = getNonRoutineServicesInCart(currentSelectedServices);
        if (nonRoutine.length > 0) {
          const names = nonRoutine
            .map(s => s.name?.trim())
            .filter(Boolean)
            .join(', ');
          setNonRoutineNamesForAlert(names || t('bookAppointment.routineNotAvailable'));
          setShowSwitchToRoutineAlert(true);
          return;
        }

        if (!isCartRoutineEligible(currentSelectedServices)) {
          showToast({
            type: 'error',
            message: t('bookAppointment.noRoutineServicesAfterSwitch'),
          });
          return;
        }

        setBookingType('routine');
        setShowVolumeTiers(false);
        setShowRoutineHowItWorks(false);
      }
    },
    [currentSelectedServices, t],
  );

  const openDateTimeModal = useCallback(() => {
    if (
      bookingType === 'routine' &&
      routineSessions.length >= maxRoutineSessions
    ) {
      showToast({
        type: 'error',
        message: t('bookAppointment.routineMaxSessions', {
          max: maxRoutineSessions,
        }),
      });
      return;
    }
    setShowDateTimeModal(true);
  }, [bookingType, routineSessions.length, maxRoutineSessions, t]);

  const servicesSubtotal = useMemo(() => {
    const price = (currentSelectedServices || []).reduce(
      (sum: number, service: any) => {
        const basePrice = Number(service?.price) || 0;
        let addOnsTotal = 0;
        if (service?.selectedAddOns?.length > 0) {
          service.selectedAddOns.forEach((addOn: any) => {
            if (!addOn) return;
            const addOnPrice = Number(addOn.price) || 0;
            const discountPct = Math.min(
              100,
              Math.max(0, Number(addOn.discountPercentage) || 0),
            );
            const discountedAddOnPrice = addOnPrice * (1 - discountPct / 100);
            addOnsTotal += Number.isFinite(discountedAddOnPrice)
              ? discountedAddOnPrice
              : addOnPrice;
          });
        }
        return sum + basePrice + addOnsTotal;
      },
      0,
    );
    return Number.isFinite(price) ? price : 0;
  }, [currentSelectedServices]);

  const sessionCount = routineSessions.length;
  const activeVolumeTier = useMemo(
    () => getVolumeDiscountForSessionCount(sessionCount, discountTiers),
    [sessionCount, discountTiers],
  );

  const routinePricing = useMemo(() => {
    const perSessionSubtotal = servicesSubtotal;
    const packageSubtotal = perSessionSubtotal * sessionCount;
    if (!activeVolumeTier) {
      return {
        perSessionSubtotal,
        packageSubtotal,
        discountPercent: 0,
        discountAmount: 0,
        totalPrice: packageSubtotal,
        tier: null as string | null,
      };
    }
    const { discountAmount, total } = applyVolumeDiscount(
      packageSubtotal,
      activeVolumeTier.discountPercent,
    );
    return {
      perSessionSubtotal,
      packageSubtotal,
      discountPercent: activeVolumeTier.discountPercent,
      discountAmount,
      totalPrice: total,
      tier: activeVolumeTier.tier,
    };
  }, [servicesSubtotal, sessionCount, activeVolumeTier]);

  const totalPrice =
    bookingType === 'routine' ? routinePricing.totalPrice : servicesSubtotal;

  const totalDuration = useMemo(() => {
    const perService = currentSelectedServices.reduce(
      (sum: number, service: any) => {
        let serviceDuration = service.time || 0;
        if (service.selectedAddOns?.length > 0) {
          service.selectedAddOns.forEach((addOn: any) => {
            serviceDuration += addOn.duration || 0;
          });
        }
        return sum + serviceDuration;
      },
      0,
    );
    return bookingType === 'routine'
      ? perService * Math.max(sessionCount, 1)
      : perService;
  }, [currentSelectedServices, bookingType, sessionCount]);

  const handleRemoveService = (serviceId: string) => {
    if (currentSelectedServices.length > 1) {
      setCurrentSelectedServices(prev => prev.filter(s => s._id !== serviceId));
    }
  };

  const handleAddService = () => setShowServiceModal(true);

  const handleServiceSelection = (selectedServiceIds: string[]) => {
    let ids = selectedServiceIds;

    if (restrictServicePickerToRoutine) {
      ids = ids.filter(serviceId => {
        const service = services.find((s: any) => s._id === serviceId);
        return service && isServiceRoutineEnabled(service);
      });
    } else {
      ids = ids.filter(serviceId => {
        const service = services.find((s: any) => s._id === serviceId);
        return (
          service &&
          serviceSupportsDeliveryPreference(service, deliveryMode)
        );
      });
    }

    if (ids.length === 0) return;

    const updatedServices = ids
      .map((serviceId: string) => {
        const existing = currentSelectedServices.find(
          (s: any) => s._id === serviceId,
        );
        if (existing) return existing;
        const service = services.find((s: any) => s._id === serviceId);
        return service ? { ...service, selectedAddOns: [] } : null;
      })
      .filter(Boolean);
    setCurrentSelectedServices(updatedServices);
    setShowServiceModal(false);
  };

  const handleAddAddOns = (service: any) => {
    setSelectedServiceForAddOns(service);
    setShowAddOnModal(true);
  };

  const handleAddOnSelection = (selectedAddOnIds: string[]) => {
    if (!selectedServiceForAddOns) return;
    const addOns =
      selectedServiceForAddOns.serviceAddOns?.filter((addOn: any) =>
        selectedAddOnIds.includes(addOn._id),
      ) || [];
    setCurrentSelectedServices(prev =>
      prev.map(service =>
        service._id === selectedServiceForAddOns._id
          ? { ...service, selectedAddOns: addOns }
          : service,
      ),
    );
    setShowAddOnModal(false);
    setSelectedServiceForAddOns(null);
  };

  const handleSingleDateTimeConfirm = (date: string, time: string) => {
    setSelectedDateString(date);
    setSelectedTimeSlot(time);
  };

  const handleAddRoutineSession = (date: string, time: string) => {
    if (!isAfterRoutineAdvanceWindow(date, time, routineAdvanceNoticeMs)) {
      showToast({
        type: 'error',
        message: t('bookAppointment.routineAdvanceNoticeRequired', {
          hours: routineAdvanceNoticeHours,
        }),
      });
      return;
    }

    const duplicate = routineSessions.some(
      s => s.date === date && s.time === time,
    );
    if (duplicate) {
      showToast({
        type: 'error',
        message: t('bookAppointment.routineDuplicateSession'),
      });
      return;
    }
    if (routineSessions.length >= maxRoutineSessions) {
      showToast({
        type: 'error',
        message: t('bookAppointment.routineMaxSessions', {
          max: maxRoutineSessions,
        }),
      });
      return;
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setRoutineSessions(prev => [
      ...prev,
      { id: `${date}_${time}_${Date.now()}`, date, time },
    ]);
    showToast({
      type: 'success',
      message: t('bookAppointment.routineSessionAdded'),
    });
  };

  const handleRemoveRoutineSession = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setRoutineSessions(prev => prev.filter(s => s.id !== id));
  };

  const handleBook = () => {
    if (bookingType === 'single') {
      if (!selectedTimeSlot) {
        showToast({
          type: 'error',
          message: t('bookAppointment.messages.selectSlot'),
        });
        return;
      }
      const bookingJson = {
        bookingType: 'single' as const,
        providerId,
        selectedServices: currentSelectedServices,
        date: selectedDateString,
        timeSlot: selectedTimeSlot,
        deliveryMode: bookingDetails.deliveryMode,
        totalPrice,
        totalDuration: `${totalDuration}m`,
        providerData,
        promotionsDisabled: false,
      };
      navigation.navigate(SCREEN_NAMES.BOOKING_SUMMARY, {
        bookingData: bookingJson,
      });
      return;
    }

    if (sessionCount < ROUTINE_MIN_SESSIONS) {
      showToast({
        type: 'error',
        message: t('bookAppointment.routineMinSessions', {
          min: ROUTINE_MIN_SESSIONS,
        }),
      });
      return;
    }

    const hasSessionInsideAdvanceWindow = routineSessions.some(
      session =>
        !isAfterRoutineAdvanceWindow(
          session.date,
          session.time,
          routineAdvanceNoticeMs,
        ),
    );
    if (hasSessionInsideAdvanceWindow) {
      showToast({
        type: 'error',
        message: t('bookAppointment.routineAdvanceNoticeRequired', {
          hours: routineAdvanceNoticeHours,
        }),
      });
      return;
    }

    const bookingJson = {
      bookingType: 'routine' as const,
      providerId,
      selectedServices: currentSelectedServices,
      sessions: routineSessions.map(({ date, time }) => ({
        date,
        timeSlot: time,
      })),
      sessionCount,
      deliveryMode: bookingDetails.deliveryMode,
      subtotalBeforeDiscount: routinePricing.packageSubtotal,
      volumeDiscount: activeVolumeTier
        ? {
            percent: activeVolumeTier.discountPercent,
            tier: activeVolumeTier.tier,
            amount: routinePricing.discountAmount,
          }
        : null,
      totalPrice: routinePricing.totalPrice,
      totalDuration: `${totalDuration}m`,
      providerData,
      promotionsDisabled: true,
    };

    navigation.navigate(SCREEN_NAMES.BOOKING_SUMMARY, {
      bookingData: bookingJson,
    });
  };

  const singleDateTimeLabel =
    selectedTimeSlot != null
      ? `${formatDateDisplay(selectedDateString)} · ${selectedTimeSlot}`
      : t('bookAppointment.tapToSelectDateTime');

  const canBook =
    bookingType === 'single'
      ? !!selectedTimeSlot && currentSelectedServices.length > 0
      : sessionCount >= ROUTINE_MIN_SESSIONS &&
        currentSelectedServices.length > 0;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <AppHeader
        title={t('bookAppointment.headerTitle')}
        onLeftPress={() => navigation.goBack()}
        backgroundColor="transparent"
        tintColor={theme.colors.text}
        containerStyle={{ marginHorizontal: theme.SW(20) }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        <BookAppointmentPreferenceRow
          deliveryMode={bookingDetails?.deliveryMode ?? ''}
        />

        {showBookingTypeTabs ? (
          <BookAppointmentBookingTypeSelector
            value={bookingType}
            onChange={handleBookingTypeChange}
          />
        ) : null}

        {bookingType === 'routine' && routineEligible ? (
          <>
            <RoutineHowItWorksSection
              expanded={showRoutineHowItWorks}
              onToggle={() => setShowRoutineHowItWorks(v => !v)}
            />
            <VolumeDiscountTiersSection
              expanded={showVolumeTiers}
              onToggle={() => setShowVolumeTiers(v => !v)}
              sessionCount={sessionCount}
              activeTier={activeVolumeTier}
              discountTiers={discountTiers}
            />
          </>
        ) : null}

        <BookAppointmentSessionSection
          bookingType={bookingType}
          singleDateTimeLabel={singleDateTimeLabel}
          hasSingleTime={!!selectedTimeSlot}
          routineSessions={routineSessions}
          routineMaxDate={routineMaxDate}
          maxRoutineSessions={maxRoutineSessions}
          onOpenModal={openDateTimeModal}
          onRemoveSession={handleRemoveRoutineSession}
        />

        

        {isLoadingServices ? (
          <ActivityIndicator
            color={theme.colors.primary}
            style={{ marginVertical: theme.SH(16) }}
          />
        ) : (
          <ServiceCart
            services={currentSelectedServices}
            onRemoveService={handleRemoveService}
            onAddAddOns={handleAddAddOns}
            onAddService={handleAddService}
          />
        )}
        {bookingType === 'routine' && sessionCount >= ROUTINE_MIN_SESSIONS ? (
          <RoutinePackageSummaryCard
            packageSubtotal={routinePricing.packageSubtotal}
            discountAmount={routinePricing.discountAmount}
            totalPrice={routinePricing.totalPrice}
            activeTier={activeVolumeTier}
          />
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        {bookingType === 'routine' && sessionCount > 0 ? (
          <View style={styles.summaryPreview}>
            <CustomText style={styles.summaryPreviewText}>
              {formatAmount(totalPrice)} · {sessionCount}{' '}
              {t('bookAppointment.sessionsLabel')}
            </CustomText>
          </View>
        ) : null}
        <CustomButton
          title={t('bookAppointment.bookButton')}
          onPress={handleBook}
          disable={!canBook}
          buttonStyle={styles.bookButton}
          backgroundColor={theme.colors.primary}
          textColor={theme.colors.whitetext}
        />
      </View>

      <BookAppointmentDateTimeModal
        visible={showDateTimeModal}
        providerId={providerId}
        mode={bookingType}
        initialDate={
          bookingType === 'single' ? selectedDateString : routineMinDate
        }
        initialTime={bookingType === 'single' ? selectedTimeSlot : null}
        minDate={bookingType === 'single' ? todayString : routineMinDate}
        maxDate={bookingType === 'routine' ? routineMaxDate : undefined}
        onClose={() => setShowDateTimeModal(false)}
        onConfirmSingle={handleSingleDateTimeConfirm}
        onAddRoutineSession={handleAddRoutineSession}
        routineSessionCount={sessionCount}
        maxRoutineSessions={maxRoutineSessions}
        routineAdvanceNoticeMs={routineAdvanceNoticeMs}
      />

      <ServiceSelectionModal
        visible={showServiceModal}
        onClose={() => setShowServiceModal(false)}
        onConfirm={handleServiceSelection}
        services={services}
        selectedServiceIds={currentSelectedServices.map((s: any) => s._id)}
        bookingType={bookingType}
        deliveryMode={deliveryMode}
        restrictToRoutineServices={restrictServicePickerToRoutine}
      />

      <SweetAlert
        visible={showSwitchToRoutineAlert}
        message={t('bookAppointment.switchToRoutineRemoveAlert', {
          names: nonRoutineNamesForAlert,
        })}
        isConfirmType="confirm"
        onOk={() => {
          setShowSwitchToRoutineAlert(false);
          applySwitchToRoutine();
        }}
        onCancel={() => setShowSwitchToRoutineAlert(false)}
      />

      {selectedServiceForAddOns ? (
        <AddOnSelectionModal
          visible={showAddOnModal}
          onClose={() => {
            setShowAddOnModal(false);
            setSelectedServiceForAddOns(null);
          }}
          onConfirm={handleAddOnSelection}
          addOns={selectedServiceForAddOns.serviceAddOns || []}
          selectedAddOnIds={
            selectedServiceForAddOns.selectedAddOns?.map((a: any) => a._id) ||
            []
          }
        />
      ) : null}
    </SafeAreaView>
  );
}

const createStyles = (theme: ThemeType) => {
  const { colors: Colors, SF, SW, fonts: Fonts, SH } = theme;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.white,
    },
    scrollView: { flex: 1 },
    scrollContent: {
      paddingHorizontal: SW(20),
      paddingTop: SH(4),
      paddingBottom: SH(16),
      gap: SH(12),
    },
    footer: {
      backgroundColor: Colors.white,
      paddingHorizontal: SW(20),
      paddingVertical: SH(16),
      borderTopWidth: 1,
      borderTopColor: Colors.gray || '#E0E0E0',
    },
    summaryPreview: {
      marginBottom: SH(8),
      alignItems: 'center',
    },
    summaryPreviewText: {
      fontSize: SF(14),
      fontFamily: Fonts.MEDIUM,
      color: Colors.text,
    },
    bookButton: {
      borderRadius: SF(12),
    },
  });
};
