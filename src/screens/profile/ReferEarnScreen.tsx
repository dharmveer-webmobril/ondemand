import React, { useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Share,
  Platform,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import imagePaths from '@assets';
import {
  Container,
  AppHeader,
  CustomText,
  CustomButton,
  CustomInput,
  VectoreIcons,
  showToast,
} from '@components/common';
import { useThemeContext } from '@utils/theme';
import {
  useGetReferralDashboard,
  type ReferralListItem,
} from '@services/api/queries/referralQueries';
import { formatAmount } from '@utils/formatAmount';
import {
  formatReferralDate,
  getReferralInitials,
  getReferralStatusLabel,
  getReferralTriggerLabel,
} from '@utils/referralLabels';
import { SH } from '@utils/dimensions';

function referralStatusStyle(status: string, theme: any) {
  const s = (status || '').toLowerCase();
  if (s === 'bonus_credited')
    return {
      bg: 'rgba(34,197,94,0.12)',
      color: '#16a34a',
    };
  if (s === 'pending')
    return {
      bg: 'rgba(234,179,8,0.15)',
      color: theme.colors.warningColor || '#ca8a04',
    };
  if (s === 'ineligible' || s === 'expired')
    return {
      bg: 'rgba(239,68,68,0.12)',
      color: theme.colors.error || '#dc2626',
    };
  return {
    bg: 'rgba(19,93,150,0.12)',
    color: theme.colors.primary || '#135D96',
  };
}

export default function ReferEarnScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { data, isLoading, isError, refetch, isRefetching } =
    useGetReferralDashboard();

  const dashboard = data?.ResponseData;
  const stats = dashboard?.stats;
  const referrals = dashboard?.referrals ?? [];

  const statCards = useMemo(
    () => [
      {
        key: 'totalReferrals',
        label: t('referral.statsTotalReferrals'),
        value: String(stats?.totalReferrals ?? 0),
        icon: 'people-outline',
        iconColor: theme.colors.primary || '#135D96',
        iconBg: 'rgba(19,93,150,0.12)',
      },
      {
        key: 'totalEarned',
        label: t('referral.statsTotalEarned'),
        value: formatAmount(stats?.totalEarned ?? 0),
        icon: 'cash-outline',
        iconColor: '#16a34a',
        iconBg: 'rgba(34,197,94,0.12)',
      },
      {
        key: 'pending',
        label: t('referral.statsPending'),
        value: String(stats?.pending ?? 0),
        icon: 'hourglass-outline',
        iconColor: theme.colors.warningColor || '#ca8a04',
        iconBg: 'rgba(234,179,8,0.15)',
      },
      {
        key: 'bonusCredited',
        label: t('referral.statsBonusesPaid'),
        value: String(stats?.bonusCredited ?? 0),
        icon: 'gift-outline',
        iconColor: '#7c3aed',
        iconBg: 'rgba(124,58,237,0.12)',
      },
    ],
    [stats, t, theme],
  );

  const handleCopy = useCallback(
    (text: string, messageKey: string) => {
      if (!text) return;
      Clipboard.setString(text);
      showToast({
        type: 'success',
        title: t('messages.success'),
        message: t(messageKey),
      });
    },
    [t],
  );

  const handleShareLink = useCallback(async () => {
    const shareLink = dashboard?.shareLink;
    const referralCode = dashboard?.referralCode;
    if (!shareLink) {
      showToast({
        type: 'error',
        message: t('referral.shareLinkUnavailable'),
      });
      return;
    }

    const shareMessage = [
      t('referral.title'),
      t('referral.projectName'),
      t('referral.shareMessage'),
      referralCode || '',
      shareLink,
    ].join('\n');

    try {
      await Share.share({
        message: shareMessage,
        title: t('referral.shareLink'),
        ...(Platform.OS === 'ios' ? { url: shareLink } : {}),
      });
    } catch {
      showToast({
        type: 'error',
        message: t('referral.shareFailed'),
      });
    }
  }, [dashboard?.referralCode, dashboard?.shareLink, t]);

  const renderReferralItem = (item: ReferralListItem) => {
    const user = item.referredUser;
    const pill = referralStatusStyle(item.status, theme);

    return (
      <View key={item.id} style={styles.referralCard}>
        <View style={styles.referralRow}>
          <View style={styles.avatar}>
            <CustomText style={styles.avatarText}>
              {getReferralInitials(user?.name || '')}
            </CustomText>
          </View>
          <View style={styles.referralInfo}>
            <CustomText style={styles.referralName}>{user?.name}</CustomText>
            <CustomText style={styles.referralEmail}>{user?.email}</CustomText>
            <CustomText style={styles.referralDate}>
              {t('referral.joinedOn', {
                date: formatReferralDate(user?.joinedAt || ''),
              })}
            </CustomText>
          </View>
          <View style={[styles.statusPill, { backgroundColor: pill.bg }]}>
            <CustomText style={[styles.statusPillText, { color: pill.color }]}>
              {getReferralStatusLabel(item.status, t)}
            </CustomText>
          </View>
        </View>
        {item.referrerBonusCredited ? (
          <View style={styles.creditedBar}>
            <CustomText style={styles.creditedText}>
              {t('referral.creditedToWallet', {
                amount: formatAmount(item.referrerBonusAmount),
              })}
            </CustomText>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <Container safeArea>
      <AppHeader
        title={t('referral.title')}
        onLeftPress={() => navigation.goBack()}
        rightIconName="refresh"
        rightIconFamily="Ionicons"
        containerStyle={{ paddingHorizontal: 16 }}
        onRightPress={() => refetch()}
      />

      {isLoading && !dashboard ? (
        <View style={styles.centered}>
          <ActivityIndicator
            size="large"
            color={theme.colors.primary || '#135D96'}
          />
        </View>
      ) : isError && !dashboard ? (
        <View style={styles.centered}>
          <CustomText style={styles.errorText}>
            {t('referral.loadError')}
          </CustomText>
          <CustomButton
            title={t('referral.retry')}
            onPress={() => refetch()}
            marginTop={SH(16)}
          />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetch()}
              tintColor={theme.colors.primary || '#135D96'}
            />
          }
        >
          <View style={styles.heroBanner}>
            <View style={styles.heroIconWrap}>
              <VectoreIcons
                name="trophy-outline"
                icon="Ionicons"
                size={theme.SF(28)}
                color="#fff"
              />
            </View>
            <View style={styles.heroTextWrap}>
              <CustomText style={styles.heroTitle}>
                {t('referral.bannerTitle')}
              </CustomText>
              <CustomText style={styles.heroSubtitle}>
                {t('referral.bannerSubtitle')}
              </CustomText>
            </View>
          </View>

          <View style={styles.statsRow}>
            {statCards.map(card => (
              <View key={card.key} style={styles.statCard}>
                <View
                  style={[
                    styles.statIconWrap,
                    { backgroundColor: card.iconBg },
                  ]}
                >
                  <VectoreIcons
                    name={card.icon}
                    icon="Ionicons"
                    size={theme.SF(14)}
                    color={card.iconColor}
                  />
                </View>
                <CustomText style={styles.statValue} numberOfLines={1}>
                  {card.value}
                </CustomText>
                <CustomText style={styles.statLabel} numberOfLines={2}>
                  {card.label}
                </CustomText>
              </View>
            ))}
          </View>

          <View style={styles.linkCard}>
            <View style={styles.linkCardHeader}>
              <View style={styles.linkCardHeaderLeft}>
                <CustomText style={styles.linkCardTitle}>
                  {t('referral.yourReferralLink')}
                </CustomText>
                <CustomText style={styles.linkCardSubtitle}>
                  {t('referral.linkSubtitle')}
                </CustomText>
              </View>
              <View style={styles.walletBadge}>
                <VectoreIcons
                  name="gift-outline"
                  icon="Ionicons"
                  size={theme.SF(14)}
                  color={theme.colors.primary || '#135D96'}
                />
                <CustomText style={styles.walletBadgeText}>
                  {t('referral.walletBonusBadge', {
                    currency: dashboard?.currency || 'USD',
                  })}
                </CustomText>
              </View>
            </View>

            <View style={styles.pillsRow}>
              <View style={[styles.pill, styles.pillPrimary]}>
                <CustomText style={styles.pillPrimaryText}>
                  {t('referral.rewardStep', {
                    trigger: getReferralTriggerLabel(
                      dashboard?.trigger || '',
                      t,
                    ),
                  })}
                </CustomText>
              </View>
              <View style={styles.pill}>
                <CustomText style={styles.pillText}>
                  {t('referral.youEarn', {
                    amount: formatAmount(dashboard?.referrerBonus ?? 0),
                  })}
                </CustomText>
              </View>
              <View style={styles.pill}>
                <CustomText style={styles.pillText}>
                  {t('referral.friendGets', {
                    amount: formatAmount(dashboard?.referredBonus ?? 0),
                  })}
                </CustomText>
              </View>
              <View style={[styles.pill, styles.pillWarning]}>
                <CustomText style={styles.pillWarningText}>
                  {t('referral.minBooking', {
                    amount: formatAmount(dashboard?.minBookingValue ?? 0),
                  })}
                </CustomText>
              </View>
            </View>

            <CustomText style={styles.fieldLabel}>
              {t('referral.referralCodeLabel')}
            </CustomText>
            <CustomInput
              value={dashboard?.referralCode || ''}
              isEditable={false}
              editable={false}
              rightIcon={imagePaths.copy_icon}
              onRightIconPress={() =>
                handleCopy(dashboard?.referralCode || '', 'referral.codeCopied')
              }
              marginTop={SH(8)}
            />

            <CustomText style={styles.fieldLabel}>
              {t('referral.shareLinkLabel')}
            </CustomText>
            <CustomInput
              value={dashboard?.shareLink || ''}
              isEditable={false}
              editable={false}
              rightIcon={imagePaths.copy_icon}
              onRightIconPress={() =>
                handleCopy(dashboard?.shareLink || '', 'referral.linkCopied')
              }
              marginTop={SH(8)}
            />

            <View style={styles.actionRow}>
              <CustomButton
                title={t('referral.shareLink')}
                onPress={handleShareLink}
                buttonStyle={styles.shareButton}
                marginTop={0}
              />
              <TouchableOpacity
                style={styles.copyLinkButton}
                onPress={() =>
                  handleCopy(dashboard?.shareLink || '', 'referral.linkCopied')
                }
                activeOpacity={0.75}
              >
                <VectoreIcons
                  name="link-outline"
                  icon="Ionicons"
                  size={theme.SF(18)}
                  color={theme.colors.primary || '#135D96'}
                />
                <CustomText style={styles.copyLinkText}>
                  {t('referral.copyLink')}
                </CustomText>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.listHeader}>
            <CustomText style={styles.listTitle}>
              {t('referral.peopleReferred')}
            </CustomText>
            <CustomText style={styles.listCount}>
              {t('referral.peopleCount', { count: referrals.length })}
            </CustomText>
          </View>

          {referrals.length === 0 ? (
            <View style={styles.emptyCard}>
              <CustomText style={styles.emptyText}>
                {t('referral.noReferrals')}
              </CustomText>
            </View>
          ) : (
            referrals.map(renderReferralItem)
          )}
        </ScrollView>
      )}
    </Container>
  );
}

function createStyles(theme: any) {
  const primary = theme.colors.primary || '#135D96';
  const border = theme.colors.border || 'rgba(0,0,0,0.08)';
  const text = theme.colors.text || '#111827';
  const muted = theme.colors.secondaryText || '#6b7280';

  return StyleSheet.create({
    scrollContent: {
      paddingHorizontal: SH(16),
      paddingBottom: SH(32),
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: SH(24),
    },
    errorText: {
      color: muted,
      textAlign: 'center',
      fontSize: theme.SF(14),
    },
    heroBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: primary,
      borderRadius: SH(14),
      padding: SH(16),
      marginTop: SH(12),
      gap: SH(12),
    },
    heroIconWrap: {
      width: SH(48),
      height: SH(48),
      borderRadius: SH(24),
      backgroundColor: 'rgba(255,255,255,0.18)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroTextWrap: {
      flex: 1,
    },
    heroTitle: {
      color: '#fff',
      fontFamily: theme.fonts.SEMI_BOLD,
      fontSize: theme.SF(15),
      marginBottom: SH(4),
    },
    heroSubtitle: {
      color: 'rgba(255,255,255,0.9)',
      fontFamily: theme.fonts.REGULAR,
      fontSize: theme.SF(12),
      lineHeight: theme.SF(18),
    },
    statsRow: {
      flexDirection: 'row',
      paddingVertical: SH(12),
      justifyContent: 'space-between',
    },
    statCard: {
      width: theme.SW(81),
      minWidth: 0,
      backgroundColor: theme.colors.card || '#fff',
      borderRadius: SH(10),
      borderWidth: 1,
      borderColor: border,
      padding: SH(8),
      alignItems: 'center',
    },
    statIconWrap: {
      width: SH(28),
      height: SH(28),
      borderRadius: SH(14),
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: SH(6),
    },
    statLabel: {
      color: muted,
      fontSize: theme.SF(9),
      fontFamily: theme.fonts.REGULAR,
      textAlign: 'center',
      lineHeight: theme.SF(12),
    },
    statValue: {
      color: text,
      fontSize: theme.SF(13),
      fontFamily: theme.fonts.SEMI_BOLD,
      marginBottom: SH(2),
      textAlign: 'center',
    },
    linkCard: {
      backgroundColor: theme.colors.card || '#fff',
      borderRadius: SH(14),
      borderWidth: 1,
      borderColor: border,
      padding: SH(16),
      marginBottom: SH(20),
    },
    linkCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: SH(10),
      marginBottom: SH(14),
    },
    linkCardHeaderLeft: {
      flex: 1,
    },
    linkCardTitle: {
      color: text,
      fontFamily: theme.fonts.SEMI_BOLD,
      fontSize: theme.SF(16),
      marginBottom: SH(4),
    },
    linkCardSubtitle: {
      color: muted,
      fontFamily: theme.fonts.REGULAR,
      fontSize: theme.SF(12),
      lineHeight: theme.SF(18),
    },
    walletBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SH(4),
      backgroundColor: 'rgba(19,93,150,0.08)',
      borderRadius: SH(20),
      paddingHorizontal: SH(10),
      paddingVertical: SH(6),
      alignSelf: 'flex-start',
    },
    walletBadgeText: {
      color: primary,
      fontSize: theme.SF(11),
      fontFamily: theme.fonts.MEDIUM,
    },
    pillsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SH(8),
      marginBottom: SH(16),
    },
    pill: {
      backgroundColor: theme.colors.background || '#f3f4f6',
      borderRadius: SH(20),
      paddingHorizontal: SH(12),
      paddingVertical: SH(6),
    },
    pillPrimary: {
      backgroundColor: 'rgba(19,93,150,0.1)',
    },
    pillWarning: {
      backgroundColor: 'rgba(234,179,8,0.15)',
    },
    pillText: {
      color: text,
      fontSize: theme.SF(11),
      fontFamily: theme.fonts.MEDIUM,
    },
    pillPrimaryText: {
      color: primary,
      fontSize: theme.SF(11),
      fontFamily: theme.fonts.MEDIUM,
    },
    pillWarningText: {
      color: theme.colors.warningColor || '#ca8a04',
      fontSize: theme.SF(11),
      fontFamily: theme.fonts.MEDIUM,
    },
    fieldLabel: {
      color: text,
      fontFamily: theme.fonts.MEDIUM,
      fontSize: theme.SF(13),
      marginTop: SH(4),
    },
    actionRow: {
      marginTop: SH(16),
      gap: SH(10),
    },
    shareButton: {
      width: '100%',
    },
    copyLinkButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SH(8),
      borderWidth: 1,
      borderColor: primary,
      borderRadius: SH(10),
      paddingVertical: SH(12),
    },
    copyLinkText: {
      color: primary,
      fontFamily: theme.fonts.SEMI_BOLD,
      fontSize: theme.SF(14),
    },
    listHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SH(12),
    },
    listTitle: {
      color: text,
      fontFamily: theme.fonts.SEMI_BOLD,
      fontSize: theme.SF(16),
    },
    listCount: {
      color: muted,
      fontFamily: theme.fonts.REGULAR,
      fontSize: theme.SF(13),
    },
    referralCard: {
      backgroundColor: theme.colors.card || '#fff',
      borderRadius: SH(12),
      borderWidth: 1,
      borderColor: border,
      padding: SH(14),
      marginBottom: SH(10),
    },
    referralRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: SH(10),
    },
    avatar: {
      width: SH(44),
      height: SH(44),
      borderRadius: SH(22),
      backgroundColor: primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      color: '#fff',
      fontFamily: theme.fonts.SEMI_BOLD,
      fontSize: theme.SF(14),
    },
    referralInfo: {
      flex: 1,
    },
    referralName: {
      color: text,
      fontFamily: theme.fonts.SEMI_BOLD,
      fontSize: theme.SF(14),
    },
    referralEmail: {
      color: muted,
      fontFamily: theme.fonts.REGULAR,
      fontSize: theme.SF(12),
      marginTop: SH(2),
    },
    referralDate: {
      color: muted,
      fontFamily: theme.fonts.REGULAR,
      fontSize: theme.SF(11),
      marginTop: SH(4),
    },
    statusPill: {
      borderRadius: SH(20),
      paddingHorizontal: SH(10),
      paddingVertical: SH(5),
    },
    statusPillText: {
      fontSize: theme.SF(11),
      fontFamily: theme.fonts.MEDIUM,
    },
    creditedBar: {
      marginTop: SH(12),
      backgroundColor: 'rgba(34,197,94,0.1)',
      borderWidth: 1,
      borderColor: 'rgba(34,197,94,0.25)',
      borderRadius: SH(8),
      paddingVertical: SH(8),
      paddingHorizontal: SH(12),
    },
    creditedText: {
      color: '#16a34a',
      fontFamily: theme.fonts.MEDIUM,
      fontSize: theme.SF(12),
    },
    emptyCard: {
      backgroundColor: theme.colors.card || '#fff',
      borderRadius: SH(12),
      borderWidth: 1,
      borderColor: border,
      padding: SH(24),
      alignItems: 'center',
    },
    emptyText: {
      color: muted,
      fontFamily: theme.fonts.REGULAR,
      fontSize: theme.SF(14),
      textAlign: 'center',
    },
  });
}
