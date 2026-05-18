import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { CustomText, VectoreIcons } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';
import { formatDateDisplay } from '@utils/routineVolumeDiscount';

export type RoutineSessionListItem = {
  id: string;
  date: string;
  time: string;
};

type RoutineSessionsListProps = {
  sessions: RoutineSessionListItem[];
  /** Show remove control per row (book appointment). */
  editable?: boolean;
  onRemove?: (id: string) => void;
  /** Max height of the scroll area before user scrolls. */
  maxScrollHeight?: number;
  /** When session count exceeds this, list starts collapsed (read-only screens). */
  collapseThreshold?: number;
  /** Force collapsed state on mount for summary/checkout. */
  defaultCollapsed?: boolean;
};

const COLLAPSE_THRESHOLD_DEFAULT = 5;
const SCROLL_FADE_THRESHOLD = 8;

export function toRoutineSessionListItems(
  sessions: Array<{
    id?: string;
    date: string;
    time?: string;
    timeSlot?: string;
  }>,
): RoutineSessionListItem[] {
  return sessions.map((session, index) => ({
    id:
      session.id ??
      `${session.date}_${session.timeSlot ?? session.time ?? index}`,
    date: session.date,
    time: session.timeSlot ?? session.time ?? '',
  }));
}

export default function RoutineSessionsList({
  sessions,
  editable = false,
  onRemove,
  maxScrollHeight,
  collapseThreshold = COLLAPSE_THRESHOLD_DEFAULT,
  defaultCollapsed,
}: RoutineSessionsListProps) {
  const { t } = useTranslation();
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const count = sessions.length;
  const canCollapse = !editable && count > collapseThreshold;
  const [expanded, setExpanded] = useState(() => {
    if (editable) return true;
    if (defaultCollapsed === true) return false;
    if (defaultCollapsed === false) return true;
    return count <= collapseThreshold;
  });
  const [scrollTop, setScrollTop] = useState(true);
  const [scrollBottom, setScrollBottom] = useState(
    count <= SCROLL_FADE_THRESHOLD,
  );

  const listMaxHeight = maxScrollHeight ?? theme.SH(220);
  const useScroll = count > 3;
  const showList = editable || !canCollapse || expanded;

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
      setScrollTop(contentOffset.y <= 4);
      setScrollBottom(
        contentOffset.y + layoutMeasurement.height >= contentSize.height - 8,
      );
    },
    [],
  );

  if (count === 0) {
    return null;
  }

  const first = sessions[0];
  const last = sessions[count - 1];

  return (
    <View style={styles.wrap}>
      {canCollapse ? (
        <Pressable
          style={styles.headerRow}
          onPress={() => setExpanded(v => !v)}
          accessibilityRole="button"
        >
          <View style={styles.headerLeft}>
            <View style={styles.countBadge}>
              <CustomText style={styles.countBadgeText}>{count}</CustomText>
            </View>
            <View style={styles.headerTextBlock}>
              <CustomText style={styles.headerTitle}>
                {t('bookAppointment.sessionSchedule')}
              </CustomText>
              {!expanded ? (
                <CustomText style={styles.headerPreview} numberOfLines={1}>
                  {formatDateDisplay(first.date)} · {first.time}
                  {count > 1
                    ? ` → ${formatDateDisplay(last.date)} · ${last.time}`
                    : ''}
                </CustomText>
              ) : (
                <CustomText style={styles.headerPreview}>
                  {t('bookAppointment.hideSessionSchedule')}
                </CustomText>
              )}
            </View>
          </View>
          <VectoreIcons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            icon="Ionicons"
            size={theme.SF(22)}
            color={theme.colors.primary}
          />
        </Pressable>
      ) : null}

      {showList ? (
        <View style={styles.listShell}>
          {useScroll && !scrollTop ? (
            <View style={styles.fadeTop} pointerEvents="none" />
          ) : null}
          <ScrollView
            style={[styles.scroll, useScroll && { maxHeight: listMaxHeight }]}
            contentContainerStyle={styles.scrollContent}
            nestedScrollEnabled
            showsVerticalScrollIndicator={useScroll}
            onScroll={useScroll ? handleScroll : undefined}
            scrollEventThrottle={16}
            keyboardShouldPersistTaps="handled"
          >
            {sessions.map((session, index) => (
              <View key={session.id} style={styles.sessionRow}>
                <View style={styles.sessionIndex}>
                  <CustomText style={styles.sessionIndexText}>
                    {index + 1}
                  </CustomText>
                </View>
                <View style={styles.sessionInfo}>
                  <CustomText style={styles.sessionDate}>
                    {formatDateDisplay(session.date)}
                  </CustomText>
                  <CustomText style={styles.sessionTime}>
                    {session.time}
                  </CustomText>
                </View>
                {editable && onRemove ? (
                  <Pressable
                    onPress={() => onRemove(session.id)}
                    hitSlop={12}
                    accessibilityRole="button"
                    accessibilityLabel={t('bookAppointment.removeSession')}
                  >
                    <VectoreIcons
                      name="trash-outline"
                      icon="Ionicons"
                      size={theme.SF(20)}
                      color={
                        (theme.colors as { error?: string }).error || '#c0392b'
                      }
                    />
                  </Pressable>
                ) : null}
              </View>
            ))}
          </ScrollView>
          {useScroll && !scrollBottom ? (
            <View style={styles.fadeBottom} pointerEvents="none" />
          ) : null}
          {useScroll ? (
            <View style={styles.scrollHint} pointerEvents="none">
              <VectoreIcons
                name="swap-vertical"
                icon="Ionicons"
                size={theme.SF(14)}
                color={theme.colors.lightText}
              />
              <CustomText style={styles.scrollHintText}>
                {t('bookAppointment.scrollSessions')}
              </CustomText>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    wrap: {
      marginTop: theme.SH(8),
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.SH(10),
      paddingHorizontal: theme.SW(12),
      borderRadius: theme.SF(10),
      backgroundColor: theme.colors.secondary || '#E8F4FD',
      borderWidth: 1,
      borderColor: theme.colors.primary || '#135D96',
    },
    headerRowStatic: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.SW(10),
      marginBottom: theme.SH(6),
    },
    headerLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.SW(10),
    },
    headerTextBlock: {
      flex: 1,
    },
    headerTitle: {
      fontSize: theme.fontSize.sm,
      fontFamily: theme.fonts.SEMI_BOLD,
      color: theme.colors.text,
    },
    headerPreview: {
      fontSize: theme.fontSize.xs,
      fontFamily: theme.fonts.REGULAR,
      color: theme.colors.lightText,
      marginTop: 2,
    },
    countBadge: {
      minWidth: theme.SF(32),
      height: theme.SF(32),
      borderRadius: theme.SF(16),
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.SW(6),
    },
    countBadgeText: {
      fontSize: theme.fontSize.sm,
      fontFamily: theme.fonts.BOLD,
      color: theme.colors.white,
    },
    listShell: {
      marginTop: theme.SH(8),
      borderRadius: theme.SF(10),
      borderWidth: 1,
      borderColor: theme.colors.gray || '#E8E8E8',
      backgroundColor: theme.colors.background || '#F8F8F8',
      overflow: 'hidden',
    },
    scroll: {},
    scrollContent: {
      paddingVertical: theme.SH(6),
      paddingHorizontal: theme.SW(8),
    },
    sessionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.SH(8),
      paddingHorizontal: theme.SW(8),
      marginBottom: theme.SH(4),
      borderRadius: theme.SF(8),
      backgroundColor: theme.colors.white,
    },
    sessionIndex: {
      width: theme.SF(26),
      height: theme.SF(26),
      borderRadius: theme.SF(13),
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.SW(10),
    },
    sessionIndexText: {
      fontSize: theme.fontSize.xs,
      fontFamily: theme.fonts.BOLD,
      color: theme.colors.white,
    },
    sessionInfo: {
      flex: 1,
    },
    sessionDate: {
      fontSize: theme.fontSize.sm,
      fontFamily: theme.fonts.SEMI_BOLD,
      color: theme.colors.text,
    },
    sessionTime: {
      fontSize: theme.fontSize.xs,
      fontFamily: theme.fonts.REGULAR,
      color: theme.colors.lightText,
      marginTop: 1,
    },
    fadeTop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: theme.SH(20),
      backgroundColor: 'rgba(248,248,248,0.92)',
      zIndex: 2,
    },
    fadeBottom: {
      position: 'absolute',
      bottom: theme.SH(28),
      left: 0,
      right: 0,
      height: theme.SH(24),
      backgroundColor: 'rgba(248,248,248,0.92)',
      zIndex: 2,
    },
    scrollHint: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.SW(4),
      paddingVertical: theme.SH(6),
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.gray || '#E0E0E0',
      backgroundColor: theme.colors.white,
    },
    scrollHintText: {
      fontSize: theme.fontSize.xs,
      fontFamily: theme.fonts.REGULAR,
      color: theme.colors.lightText,
    },
  });
