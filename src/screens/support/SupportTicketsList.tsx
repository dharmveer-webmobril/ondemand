import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import {
  Container,
  AppHeader,
  CustomText,
  CustomButton,
} from '@components/common';
import { useThemeContext } from '@utils/theme';
import SCREEN_NAMES from '@navigation/ScreenNames';
import {
  useGetSupportTickets,
  getSupportTicketDisplayId,
  getSupportTicketReportTypeName,
  type SupportTicket,
} from '@services/api/queries/supportTicketQueries';
import {
  formatSupportTicketDate,
  getSupportPriorityLabelKey,
  getSupportStatusLabelKey,
  supportPriorityStyle,
  supportStatusStyle,
} from '@utils/supportTicketLabels';
import { SH } from '@utils/dimensions';

const PAGE_SIZE = 20;

const STATUS_FILTERS = [
  { key: 'all', labelKey: 'supportTickets.filterAll' },
  { key: 'open', labelKey: 'supportTickets.filterOpen' },
  { key: 'in_progress', labelKey: 'supportTickets.filterInProgress' },
  { key: 'resolved', labelKey: 'supportTickets.filterResolved' },
  { key: 'closed', labelKey: 'supportTickets.filterClosed' },
] as const;

export default function SupportTicketsList() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [statusFilter, setStatusFilter] =
    useState<(typeof STATUS_FILTERS)[number]['key']>('all');

  const { data, isLoading, isError, refetch, isRefetching } =
    useGetSupportTickets({
      page: 1,
      limit: PAGE_SIZE,
      status: statusFilter,
    });

  const tickets = data?.tickets ?? [];

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const emptyMessage =
    statusFilter === 'all'
      ? t('supportTickets.empty')
      : t('supportTickets.emptyFiltered', {
          status: t(`supportTickets.status.${statusFilter}`),
        });

  const renderTicket = useCallback(
    ({ item }: { item: SupportTicket }) => {
      const statusStyle = supportStatusStyle(item.status, theme);
      const priorityStyle = supportPriorityStyle(item.priority);

      return (
        <TouchableOpacity
          style={styles.ticketCard}
          activeOpacity={0.75}
          onPress={() =>
            navigation.navigate(SCREEN_NAMES.SUPPORT_TICKET_DETAIL, {
              ticketId: item._id || item.id,
            })
          }
        >
          <View style={styles.ticketTopRow}>
            <CustomText style={styles.ticketId}>
              {getSupportTicketDisplayId(item)}
            </CustomText>
            <View
              style={[
                styles.priorityPill,
                { backgroundColor: priorityStyle.bg },
              ]}
            >
              <CustomText
                style={[styles.priorityText, { color: priorityStyle.color }]}
              >
                {t(getSupportPriorityLabelKey(item.priority))}
              </CustomText>
            </View>
          </View>

          <CustomText style={styles.ticketTitle} numberOfLines={2}>
            {item.title}
          </CustomText>

          <CustomText style={styles.ticketMeta} numberOfLines={1}>
            {getSupportTicketReportTypeName(item)}
          </CustomText>

          <View style={styles.ticketBottomRow}>
            <View
              style={[
                styles.statusPill,
                {
                  backgroundColor: statusStyle.bg,
                  borderColor: statusStyle.border,
                },
              ]}
            >
              <CustomText style={[styles.statusText, { color: statusStyle.color }]}>
                {t(getSupportStatusLabelKey(item.status))}
              </CustomText>
            </View>
            <CustomText style={styles.createdAt}>
              {formatSupportTicketDate(item.createdAt)}
            </CustomText>
          </View>
        </TouchableOpacity>
      );
    },
    [navigation, styles, t, theme],
  );

  return (
    <Container safeArea style={styles.container}>
      <AppHeader
        title={t('supportTickets.title')}
        onLeftPress={() => navigation.goBack()}
        rightIconName="refresh"
        rightIconFamily="Ionicons"
        containerStyle={styles.headerContainer}
        onRightPress={handleRefresh}
      />

      <View style={styles.subtitleWrap}>
        <CustomText style={styles.subtitle}>
          {t('supportTickets.subtitle')}
        </CustomText>
      </View>

      <View style={styles.actionsRow}>
        <CustomButton
          title={t('supportTickets.newTicket')}
          onPress={() => navigation.navigate(SCREEN_NAMES.CREATE_SUPPORT_TICKET)}
          buttonStyle={styles.newTicketBtn}
          buttonTextStyle={styles.newTicketBtnText}
        />
      </View>

      <View style={styles.filterWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterRow}
        >
          {STATUS_FILTERS.map(item => {
            const active = statusFilter === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setStatusFilter(item.key)}
              >
                <CustomText
                  style={[
                    styles.filterChipText,
                    // @ts-ignore
                    active && styles.filterChipTextActive,
                  ]}
                >
                  {t(item.labelKey)}
                </CustomText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {isLoading && !data ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <CustomText style={styles.emptyText}>
            {t('supportTickets.loadError')}
          </CustomText>
          <CustomButton
            title={t('supportTickets.retry')}
            onPress={handleRefresh}
            buttonStyle={styles.retryBtn}
          />
        </View>
      ) : (
        <FlatList
          data={tickets}
          style={styles.ticketList}
          keyExtractor={(item, index) => item._id || item.id || String(index)}
          renderItem={renderTicket}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <CustomText style={styles.emptyText}>{emptyMessage}</CustomText>
            </View>
          }
        />
      )}
    </Container>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background || '#F7F7F7',
    },
    headerContainer: {
      paddingHorizontal: theme.SW(20),
    },
    subtitleWrap: {
      paddingHorizontal: theme.SW(20),
      paddingTop: theme.SH(4),
    },
    subtitle: {
      fontSize: theme.SF(13),
      color: theme.colors.lightText || '#6b7280',
      fontFamily: theme.fonts.REGULAR,
    },
    actionsRow: {
      paddingHorizontal: theme.SW(20),
      paddingTop: theme.SH(12),
    },
    newTicketBtn: {
      width: '100%',
      borderRadius: theme.borderRadius.md,
      minHeight: theme.SH(44),
    },
    newTicketBtnText: {
      fontSize: theme.SF(14),
      fontFamily: theme.fonts.SEMI_BOLD,
    },
    filterWrap: {
      paddingVertical: theme.SH(10),
    },
    filterScroll: {
      flexGrow: 0,
      minHeight: theme.SH(40),
    },
    filterRow: {
      paddingHorizontal: theme.SW(20),
      alignItems: 'center',
    },
    filterChip: {
      paddingHorizontal: theme.SW(16),
      paddingVertical: theme.SH(8),
      borderRadius: 999,
      backgroundColor: theme.colors.white,
      borderWidth: 1,
      borderColor: `${theme.colors.text}20`,
      marginRight: theme.SW(8),
      justifyContent: 'center',
      alignItems: 'center',
      maxHeight: theme.SH(40),
    },
    filterChipActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    filterChipText: {
      fontSize: theme.SF(13),
      lineHeight: theme.SF(20),
      fontFamily: theme.fonts.MEDIUM,
      color: theme.colors.text,
      textAlign: 'center',
    },
    filterChipTextActive: {
      color: theme.colors.white,
    },
    ticketList: {
      flex: 1,
    },
    listContent: {
      paddingHorizontal: theme.SW(20),
      paddingBottom: theme.SH(30),
    },
    ticketCard: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.borderRadius.md,
      padding: theme.SW(16),
      marginBottom: theme.SH(12),
      borderWidth: 1,
      borderColor: `${theme.colors.text}10`,
    },
    ticketTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.SH(8),
    },
    ticketId: {
      fontSize: theme.SF(14),
      fontFamily: theme.fonts.SEMI_BOLD,
      color: theme.colors.primary,
    },
    priorityPill: {
      borderRadius: 999,
      paddingHorizontal: theme.SW(10),
      paddingVertical: theme.SH(4),
    },
    priorityText: {
      fontSize: theme.SF(11),
      fontFamily: theme.fonts.SEMI_BOLD,
    },
    ticketTitle: {
      fontSize: theme.SF(15),
      fontFamily: theme.fonts.SEMI_BOLD,
      color: theme.colors.text,
      marginBottom: theme.SH(4),
    },
    ticketMeta: {
      fontSize: theme.SF(13),
      fontFamily: theme.fonts.REGULAR,
      color: theme.colors.lightText || '#6b7280',
      marginBottom: theme.SH(10),
    },
    ticketBottomRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statusPill: {
      borderRadius: 999,
      paddingHorizontal: theme.SW(10),
      paddingVertical: theme.SH(4),
      borderWidth: 1,
    },
    statusText: {
      fontSize: theme.SF(11),
      fontFamily: theme.fonts.SEMI_BOLD,
    },
    createdAt: {
      fontSize: theme.SF(12),
      color: theme.colors.lightText || '#6b7280',
      fontFamily: theme.fonts.REGULAR,
    },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.SW(24),
    },
    emptyText: {
      fontSize: theme.SF(14),
      color: theme.colors.lightText || '#6b7280',
      textAlign: 'center',
      fontFamily: theme.fonts.REGULAR,
    },
    retryBtn: {
      marginTop: theme.SH(12),
      paddingHorizontal: theme.SW(20),
    },
  });
