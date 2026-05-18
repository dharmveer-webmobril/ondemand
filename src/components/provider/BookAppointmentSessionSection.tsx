import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CustomText, VectoreIcons } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';
import {
  ROUTINE_MIN_SESSIONS,
  ROUTINE_MAX_SESSIONS,
  ROUTINE_MAX_DAYS_AHEAD,
  formatDateDisplay,
  type RoutineSession,
} from '@utils/routineVolumeDiscount';
import RoutineSessionsList, {
  toRoutineSessionListItems,
} from '@components/routine/RoutineSessionsList';
import type { BookingType } from './BookAppointmentBookingTypeSelector';

type Props = {
  bookingType: BookingType;
  singleDateTimeLabel: string;
  hasSingleTime: boolean;
  routineSessions: RoutineSession[];
  routineMaxDate: string;
  maxRoutineSessions?: number;
  onOpenModal: () => void;
  onRemoveSession: (id: string) => void;
};

export default function BookAppointmentSessionSection({
  bookingType,
  singleDateTimeLabel,
  hasSingleTime,
  routineSessions,
  routineMaxDate,
  maxRoutineSessions = ROUTINE_MAX_SESSIONS,
  onOpenModal,
  onRemoveSession,
}: Props) {
  const { t } = useTranslation();
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const sessionCount = routineSessions.length;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <VectoreIcons
          name="time-outline"
          icon="Ionicons"
          size={theme.SF(20)}
          color={theme.colors.primary}
        />
        <CustomText style={styles.title}>
          {bookingType === 'routine'
            ? t('bookAppointment.sessionDate')
            : t('bookAppointment.selectDate')}
        </CustomText>
      </View>

      {bookingType === 'single' ? (
        <Pressable style={styles.field} onPress={onOpenModal}>
          <CustomText
            style={[styles.fieldText, !hasSingleTime && styles.placeholder]}
            numberOfLines={1}
          >
            {singleDateTimeLabel}
          </CustomText>
          <VectoreIcons
            name="calendar-outline"
            icon="Ionicons"
            size={theme.SF(22)}
            color={theme.colors.primary}
          />
        </Pressable>
      ) : (
        <>
          <Pressable style={styles.field} onPress={onOpenModal}>
            <CustomText style={styles.placeholder}>
              {t('bookAppointment.tapToAddSession')}
            </CustomText>
            <VectoreIcons
              name="add-circle-outline"
              icon="Ionicons"
              size={theme.SF(24)}
              color={theme.colors.primary}
            />
          </Pressable>
          <CustomText style={styles.hint}>
            {t('bookAppointment.routineDateHint', {
              maxDate: formatDateDisplay(routineMaxDate),
              days: ROUTINE_MAX_DAYS_AHEAD,
            })}
          </CustomText>
          <CustomText style={styles.countLabel}>
            {t('bookAppointment.sessionsAdded', {
              count: sessionCount,
              min: ROUTINE_MIN_SESSIONS,
              max: maxRoutineSessions,
            })}
          </CustomText>
          {sessionCount > 0 ? (
            <RoutineSessionsList
              sessions={toRoutineSessionListItems(routineSessions)}
              editable
              onRemove={onRemoveSession}
              maxScrollHeight={theme.SH(240)}
            />
          ) : null}
        </>
      )}
    </View>
  );
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.SF(12),
      borderWidth: 1,
      borderColor: theme.colors.gray || '#E8E8E8',
      padding: theme.SW(16),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.SW(8),
      marginBottom: theme.SH(12),
    },
    title: {
      fontSize: theme.fontSize.md,
      fontFamily: theme.fonts.SEMI_BOLD,
      color: theme.colors.text,
    },
    field: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: theme.colors.gray || '#DDD',
      borderRadius: theme.SF(10),
      paddingHorizontal: theme.SW(14),
      paddingVertical: theme.SH(14),
      minHeight: theme.SH(52),
    },
    fieldText: {
      flex: 1,
      fontSize: theme.SF(15),
      fontFamily: theme.fonts.MEDIUM,
      color: theme.colors.text,
      marginRight: theme.SW(8),
    },
    placeholder: {
      flex: 1,
      fontSize: theme.SF(14),
      fontFamily: theme.fonts.REGULAR,
      color: theme.colors.lightText,
    },
    hint: {
      fontSize: theme.fontSize.xs,
      fontFamily: theme.fonts.REGULAR,
      color: theme.colors.lightText,
      marginTop: theme.SH(8),
    },
    countLabel: {
      fontSize: theme.fontSize.sm,
      fontFamily: theme.fonts.MEDIUM,
      color: theme.colors.primary,
      marginTop: theme.SH(8),
    },
  });
