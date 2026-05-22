import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { AppHeader, Container, CustomButton } from '@components/common';
import {
  RoutineBookingHeroCard,
  RoutineBookingPricingCard,
  RoutineBookingServicesSection,
  RoutineBookingSessionsSection,
  type RoutineSessionItem,
} from '@components/booking/routine';
import { useThemeContext } from '@utils/theme';
import {
  useCancelRoutineBooking,
  useDeleteRoutineSession,
  useGetRoutineBookingDetail,
} from '@services/api/queries/appQueries';
import { handleApiError, handleSuccessToast } from '@utils/apiHelpers';
import {
  canCancelRoutinePackage,
  canDeleteRoutineSession,
} from '@utils/routineBookingHelpers';
import SCREEN_NAMES from '@navigation/ScreenNames';
import { getProviderDisplayName } from '@utils/tools';
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
    footer: {
      paddingHorizontal: theme.SW(16),
      paddingTop: theme.SH(12),
      paddingBottom: theme.SH(16),
      backgroundColor: theme.colors.white,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.gray || '#E0E0E0',
    },
    cancelBtn: {
      borderRadius: theme.SF(10),
    },
  });

export default function RoutineBookingDetail() {
  const theme = useThemeContext();
  const { t } = useTranslation();
  const screenStyles = useMemo(() => createScreenStyles(theme), [theme]);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const routineBookingId = route.params?.routineBookingId as string;

  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
  const [isCancellingPackage, setIsCancellingPackage] = useState(false);

  const {
    data,
    isLoading,
    isFetching,
    refetch,
  } = useGetRoutineBookingDetail(routineBookingId);

  const deleteRoutineSession = useDeleteRoutineSession();
  const cancelRoutineBooking = useCancelRoutineBooking();

  const detail = data?.ResponseData;
  const routine = detail?.routineBooking;
  const sessions = (detail?.sessions ?? []) as RoutineSessionItem[];
  const servicesDetail = detail?.servicesDetail ?? [];

  const routineStatus = routine?.routineStatus || 'pending';
  const statusColor = getRoutineStatusColor(routineStatus);
  const statusLabel = formatRoutineStatusLabel(routineStatus, t);
  const providerName =
    typeof routine?.spId === 'object'
      ? getProviderDisplayName(
          {
            name: routine.spId?.name,
            businessProfile: routine.spId?.businessProfile,
            spBusinessProfile: routine?.spBusinessProfile,
          },
          t('bookingList.serviceProviderDefault'),
        )
      : t('bookingList.serviceProviderDefault');
  const serviceCount =
    servicesDetail.length || routine?.services?.length || 1;
  const showCancelPackage = canCancelRoutinePackage(routine?.routineStatus);

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

  const performDeleteSession = useCallback(
    async (session: RoutineSessionItem) => {
      if (!routineBookingId || !session._id) return;
      if (!canDeleteRoutineSession(session, sessions.length)) {
        Alert.alert(
          t('routineBooking.deleteSessionConfirmTitle'),
          t('routineBooking.minSessionsRequired'),
        );
        return;
      }

      setDeletingSessionId(session._id);
      try {
        const res: any = await deleteRoutineSession.mutateAsync({
          routineBookingId,
          sessionId: session._id,
        });
        if (res?.succeeded !== false) {
          handleSuccessToast(
            res?.ResponseMessage || t('routineBooking.deleteSessionSuccess'),
          );
          await refetch();
        } else {
          Alert.alert(
            t('common.error'),
            res?.ResponseMessage || t('routineBooking.deleteSessionFailed'),
          );
        }
      } catch (error) {
        handleApiError(error);
      } finally {
        setDeletingSessionId(null);
      }
    },
    [
      routineBookingId,
      sessions.length,
      deleteRoutineSession,
      refetch,
      t,
    ],
  );

  const onDeleteSession = useCallback(
    (session: RoutineSessionItem) => {
      if (!canDeleteRoutineSession(session, sessions.length)) {
        Alert.alert(
          t('routineBooking.deleteSessionConfirmTitle'),
          t('routineBooking.minSessionsRequired'),
        );
        return;
      }

      Alert.alert(
        t('routineBooking.deleteSessionConfirmTitle'),
        t('routineBooking.deleteSessionConfirmMessage'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('routineBooking.deleteSession'),
            style: 'destructive',
            onPress: () => performDeleteSession(session),
          },
        ],
      );
    },
    [sessions.length, performDeleteSession, t],
  );

  const performCancelPackage = useCallback(async () => {
    if (!routineBookingId) return;
    setIsCancellingPackage(true);
    try {
      const res: any = await cancelRoutineBooking.mutateAsync(routineBookingId);
      if (res?.succeeded !== false) {
        handleSuccessToast(
          res?.ResponseMessage || t('routineBooking.cancelPackageSuccess'),
        );
        navigation.goBack();
      } else {
        Alert.alert(
          t('common.error'),
          res?.ResponseMessage || t('routineBooking.cancelPackageFailed'),
        );
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsCancellingPackage(false);
    }
  }, [routineBookingId, cancelRoutineBooking, navigation, t]);

  const handleCancelPackagePress = useCallback(() => {
    Alert.alert(
      t('routineBooking.cancelPackageTitle'),
      t('routineBooking.cancelPackageMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          style: 'destructive',
          onPress: () => performCancelPackage(),
        },
      ],
    );
  }, [t, performCancelPackage]);

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
          onDeleteSession={onDeleteSession}
          deletingSessionId={deletingSessionId}
        />
      </ScrollView>

      {showCancelPackage ? (
        <View style={screenStyles.footer}>
          <CustomButton
            title={t('routineBooking.cancelPackage')}
            onPress={handleCancelPackagePress}
            backgroundColor={theme.colors.red || '#F44336'}
            textColor={theme.colors.white}
            buttonStyle={screenStyles.cancelBtn}
            isLoading={isCancellingPackage}
            disable={isCancellingPackage}
          />
        </View>
      ) : null}
    </Container>
  );
}
