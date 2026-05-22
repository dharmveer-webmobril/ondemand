import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BoundedVerticalScroll, CustomText, VectoreIcons } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';
import {
  canDeleteRoutineSession,
  canViewSessionBookingDetails,
  formatSessionStatusLabel,
} from '@utils/routineBookingHelpers';
import RoutineDetailSection from './RoutineDetailSection';

export type RoutineSessionItem = {
  _id: string;
  date: string;
  time: string;
  sessionStatus?: string;
  bookingId?: string | { _id?: string } | null;
};

type RoutineBookingSessionsSectionProps = {
  sessions: RoutineSessionItem[];
  routineStatus: string;
  onViewSessionDetails: (session: RoutineSessionItem) => void;
  onDeleteSession?: (session: RoutineSessionItem) => void;
  deletingSessionId?: string | null;
};

export default function RoutineBookingSessionsSection({
  sessions,
  routineStatus,
  onViewSessionDetails,
  onDeleteSession,
  deletingSessionId = null,
}: RoutineBookingSessionsSectionProps) {
  const { t } = useTranslation();
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <RoutineDetailSection
      title={t('routineBooking.sessionsSection', { count: sessions.length })}
    >
      <BoundedVerticalScroll
        itemCount={sessions.length}
        maxHeight={theme.SH(280)}
        style={styles.listBox}
      >
        {sessions.map((session, index) => {
          const showViewDetails = canViewSessionBookingDetails(
            routineStatus,
            session,
          );
          const showDelete = canDeleteRoutineSession(session, sessions.length);
          const isDeleting = deletingSessionId === session._id;

          return (
            <View
              key={session._id}
              style={[
                styles.row,
                index < sessions.length - 1 && styles.rowBorder,
              ]}
            >
              <View style={styles.info}>
                <CustomText style={styles.dateTime}>
                  {session.date} · {session.time}
                </CustomText>
                <View style={styles.statusPill}>
                  <CustomText style={styles.statusText}>
                    {formatSessionStatusLabel(session.sessionStatus, t)}
                  </CustomText>
                </View>
              </View>
              <View style={styles.actions}>
                {showDelete && onDeleteSession ? (
                  <Pressable
                    style={styles.deleteBtn}
                    onPress={() => onDeleteSession(session)}
                    disabled={isDeleting}
                    accessibilityRole="button"
                    accessibilityLabel={t('routineBooking.deleteSession')}
                  >
                    {isDeleting ? (
                      <ActivityIndicator
                        size="small"
                        color={theme.colors.red || '#F44336'}
                      />
                    ) : (
                      <VectoreIcons
                        name="trash-outline"
                        icon="Ionicons"
                        size={theme.SF(20)}
                        color={theme.colors.red || '#F44336'}
                      />
                    )}
                  </Pressable>
                ) : null}
                {showViewDetails ? (
                  <Pressable
                    style={styles.viewDetailsBtn}
                    onPress={() => onViewSessionDetails(session)}
                    accessibilityRole="button"
                    accessibilityLabel={t('routineBooking.viewSessionDetails')}
                  >
                    <CustomText style={styles.viewDetailsText}>
                      {t('routineBooking.viewSessionDetails')}
                    </CustomText>
                    <VectoreIcons
                      name="chevron-forward"
                      icon="Ionicons"
                      size={theme.SF(16)}
                      color={theme.colors.primary}
                    />
                  </Pressable>
                ) : null}
              </View>
            </View>
          );
        })}
      </BoundedVerticalScroll>
    </RoutineDetailSection>
  );
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    listBox: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.SF(12),
      borderWidth: 1,
      borderColor: theme.colors.gray || '#E8E8E8',
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.SW(14),
      gap: theme.SW(10),
    },
    rowBorder: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.gray || '#EEE',
    },
    info: {
      flex: 1,
    },
    dateTime: {
      fontSize: theme.fontSize.sm,
      fontFamily: theme.fonts.SEMI_BOLD,
      color: theme.colors.text,
    },
    statusPill: {
      alignSelf: 'flex-start',
      marginTop: theme.SH(6),
      paddingHorizontal: theme.SW(8),
      paddingVertical: theme.SH(3),
      borderRadius: theme.SF(6),
      borderWidth: 1,
      borderColor: theme.colors.gray || '#CCC',
    },
    statusText: {
      fontSize: theme.fontSize.xs,
      fontFamily: theme.fonts.MEDIUM,
      color: theme.colors.text,
      textTransform: 'lowercase',
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.SW(4),
    },
    deleteBtn: {
      padding: theme.SW(6),
      justifyContent: 'center',
      alignItems: 'center',
    },
    viewDetailsBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.SW(2),
      paddingVertical: theme.SH(6),
      paddingLeft: theme.SW(4),
    },
    viewDetailsText: {
      fontSize: theme.fontSize.sm,
      fontFamily: theme.fonts.SEMI_BOLD,
      color: theme.colors.primary,
    },
  });
