import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText, VectoreIcons } from '@components/common';
import type { CustomerReviewInfo } from '@utils/bookingReviewHelpers';

type TabKey = 'service' | 'sp' | 'member';

type BookingServiceReviewsTabsProps = {
  customerReviewInfo?: CustomerReviewInfo | null;
  hasMember: boolean;
};

function ReadOnlyStars({ value, color, size }: { value: number; color: string; size: number }) {
  const filled = Math.min(5, Math.max(0, Math.round(Number(value) || 0)));
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <VectoreIcons
          key={i}
          icon="Ionicons"
          name={i <= filled ? 'star' : 'star-outline'}
          size={size}
          color={i <= filled ? color : '#C4C4C4'}
        />
      ))}
    </View>
  );
}

export default function BookingServiceReviewsTabs({
  customerReviewInfo,
  hasMember,
}: BookingServiceReviewsTabsProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();

  const tabs = useMemo(() => {
    const base: { key: TabKey; label: string }[] = [
      { key: 'service', label: t('bookingDetail.rateReview.tabService') },
      { key: 'sp', label: t('bookingDetail.rateReview.tabSp') },
    ];
    if (hasMember) {
      base.push({ key: 'member', label: t('bookingDetail.rateReview.tabMember') });
    }
    return base;
  }, [hasMember, t]);

  const [active, setActive] = useState<TabKey>('service');

  const slice =
    active === 'service'
      ? customerReviewInfo?.service
      : active === 'sp'
        ? customerReviewInfo?.sp
        : customerReviewInfo?.member;

  return (
    <View style={styles.wrap}>
      <View style={styles.tabRow}>
        {tabs.map(tab => {
          const isActive = tab.key === active;
          return (
            <Pressable key={tab.key} style={styles.tabHit} onPress={() => setActive(tab.key)}>
              <CustomText
                style={[styles.tabLabel, ...(isActive ? [styles.tabLabelActive] : [])]}
                numberOfLines={1}
              >
                {tab.label}
              </CustomText>
              {isActive ? <View style={styles.tabUnderline} /> : <View style={styles.tabUnderlinePlaceholder} />}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.body}>
        {slice?.submitted ? (
          <>
            <ReadOnlyStars
              value={slice.rating ?? 0}
              color={theme.colors.primary}
              size={theme.SF(22)}
            />
            {slice.reviewText ? (
              <CustomText style={styles.reviewText}>{slice.reviewText}</CustomText>
            ) : (
              <CustomText style={styles.muted}>{t('bookingDetail.rateReview.noWrittenReview')}</CustomText>
            )}
          </>
        ) : (
          <CustomText style={styles.muted}>{t('bookingDetail.rateReview.notRatedYet')}</CustomText>
        )}
      </View>
    </View>
  );
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    wrap: {
      marginTop: theme.SH(12),
      paddingTop: theme.SH(12),
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border || '#E5E7EB',
    },
    tabRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
    },
    tabHit: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: theme.SH(8),
    },
    tabLabel: {
      fontSize: theme.fontSize?.xs ?? 12,
      fontFamily: theme.fonts?.MEDIUM,
      color: theme.colors.lightText,
      textAlign: 'center',
    },
    tabLabelActive: {
      color: theme.colors.primary,
      fontFamily: theme.fonts?.SEMI_BOLD,
    },
    tabUnderline: {
      marginTop: theme.SH(6),
      height: theme.SH(3),
      width: '70%',
      borderRadius: 2,
      backgroundColor: theme.colors.primary,
    },
    tabUnderlinePlaceholder: {
      marginTop: theme.SH(6),
      height: theme.SH(3),
    },
    body: {
      paddingTop: theme.SH(12),
    },
    reviewText: {
      marginTop: theme.SH(10),
      fontSize: theme.fontSize?.sm ?? 14,
      fontFamily: theme.fonts?.REGULAR,
      color: theme.colors.text,
      lineHeight: theme.SH(20),
    },
    muted: {
      marginTop: theme.SH(4),
      fontSize: theme.fontSize?.xs ?? 12,
      color: theme.colors.lightText,
      fontFamily: theme.fonts?.REGULAR,
    },
  });
