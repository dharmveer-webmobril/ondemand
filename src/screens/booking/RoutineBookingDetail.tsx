import React, { useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { AppHeader, Container } from '@components/common';
import {
  RoutineBookingHeroCard,
  RoutineBookingPricingCard,
  RoutineBookingServicesSection,
  RoutineBookingSessionsSection,
  type RoutineSessionItem,
} from '@components/booking/routine';
import { useThemeContext } from '@utils/theme';
import { useGetRoutineBookingDetail } from '@services/api/queries/appQueries';
import SCREEN_NAMES from '@navigation/ScreenNames';
import {
  formatRoutineStatusLabel,
  getRoutineStatusColor,
  getSessionBookingMongoId,
} from '@utils/routineBookingHelpers';

const createScreenStyles = (theme: ReturnType<typeof useThemeContext>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background || '#F5F5F5',
    },
    scroll: { flex: 1 },
    scrollContent: {
      padding: theme.SW(16),
      paddingBottom: theme.SH(40),
      gap: theme.SH(16),
    },
    loader: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

export default function RoutineBookingDetail() {
  const theme = useThemeContext();
  const { t } = useTranslation();
  const screenStyles = useMemo(() => createScreenStyles(theme), [theme]);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const routineBookingId = route.params?.routineBookingId as string;

  const {
    data,
    isLoading,
    isFetching,
    refetch,
  } = useGetRoutineBookingDetail(routineBookingId);

  const detail = data?.ResponseData;
  const routine = detail?.routineBooking;
  const sessions = (detail?.sessions ?? []) as RoutineSessionItem[];
  const servicesDetail = detail?.servicesDetail ?? [];

  const routineStatus = routine?.routineStatus || 'pending';
  const statusColor = getRoutineStatusColor(routineStatus);
  const statusLabel = formatRoutineStatusLabel(routineStatus, t);
  const providerName =
    typeof routine?.spId === 'object'
      ? routine.spId?.name
      : t('bookingList.serviceProviderDefault');
  const serviceCount =
    servicesDetail.length || routine?.services?.length || 1;

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const onViewSessionDetails = useCallback(
    (session: RoutineSessionItem) => {
      const bookingMongoId = getSessionBookingMongoId(session);
      if (!bookingMongoId) return;
      navigation.navigate(SCREEN_NAMES.BOOKING_DETAIL, {
        bookingId: bookingMongoId,
      });
    },
    [navigation],
  );

  if (isLoading && !routine) {
    return (
      <Container style={screenStyles.container}>
        <AppHeader
          title={t('routineBooking.detailTitle')}
          onLeftPress={() => navigation.goBack()}
          containerStyle={{ paddingHorizontal: theme.SW(16) }}
        />
        <View style={screenStyles.loader}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </Container>
    );
  }

  return (
    <Container style={screenStyles.container}>
      <AppHeader
        title={routine?.routineBookingId || t('routineBooking.detailTitle')}
        onLeftPress={() => navigation.goBack()}
        backgroundColor={theme.colors.white}
        tintColor={theme.colors.text}
        containerStyle={{ paddingHorizontal: theme.SW(16) }}
      />

      <ScrollView
        style={screenStyles.scroll}
        contentContainerStyle={screenStyles.scrollContent}
        nestedScrollEnabled
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        <RoutineBookingHeroCard
          statusLabel={statusLabel}
          statusColor={statusColor}
          servicesInPackageLabel={t('routineBooking.servicesInPackage', {
            count: serviceCount,
          })}
          providerSubtitle={t('routineBooking.providerLabel', {
            name: providerName,
          })}
        />

        <RoutineBookingPricingCard
          pricing={routine?.pricing}
          sessionCountFallback={sessions.length}
          paymentType={routine?.paymentType}
          paymentStatus={routine?.paymentStatus}
        />

        <RoutineBookingServicesSection services={servicesDetail} />

        <RoutineBookingSessionsSection
          sessions={sessions}
          routineStatus={routineStatus}
          onViewSessionDetails={onViewSessionDetails}
        />
      </ScrollView>
    </Container>
  );
}
