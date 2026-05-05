import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Container, AppHeader, CustomText, VectoreIcons } from '@components/common';
import { useThemeContext } from '@utils/theme';
import {
  useGetPaymentTransactions,
  type WalletTransaction,
  type PaymentTransactionType,
} from '@services/api/queries/appQueries';
import { SH } from '@utils/dimensions';

const PAGE_SIZE = 10;

function formatDate(dateString: string): string {
  if (!dateString) return '—';
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return dateString;
  return d.toLocaleString(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatAmount(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function extractRows(resp: any): WalletTransaction[] {
  const rd = resp?.ResponseData;
  if (Array.isArray(rd)) return rd as WalletTransaction[];
  if (Array.isArray(rd?.data)) return rd.data as WalletTransaction[];
  return [];
}

function totalPages(resp: any): number {
  const p = resp?.pagination;
  if (p?.pages != null) return Math.max(0, Number(p.pages));
  return 0;
}

function statusLabel(item: WalletTransaction, t: (k: string) => string): string {
  if (item.isRefund) return t('transactions.refund');
  const s = (item.status || '').toLowerCase();
  if (s === 'completed') return t('wallet.filterCompleted');
  return item.status || '—';
}

function pillColors(item: WalletTransaction, theme: any) {
  if (item.isRefund)
    return { bg: 'rgba(19, 93, 150, 0.12)', color: theme.colors.primary || '#135D96' };
  const s = (item.status || '').toLowerCase();
  if (s === 'completed')
    return { bg: 'rgba(34,197,94,0.12)', color: theme.colors.success || '#16a34a' };
  return { bg: 'rgba(19,93,150,0.12)', color: theme.colors.primary || '#135D96' };
}

export default function PaymentTransactionsScreen() {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const [activeType, setActiveType] = useState<PaymentTransactionType>('booking');
  const [page, setPage] = useState(1);
  const [list, setList] = useState<WalletTransaction[]>([]);

  useEffect(() => {
    setPage(1);
    setList([]);
  }, [activeType]);

  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
    isFetching,
  } = useGetPaymentTransactions({ page, limit: PAGE_SIZE, type: activeType });

  const pageRows = extractRows(data);
  const pages = totalPages(data);
  const hasMore = pages > 0 ? page < pages : pageRows.length >= PAGE_SIZE;
  const loadingMore = isFetching && page > 1;

  useEffect(() => {
    if (page === 1) {
      setList(pageRows);
    } else {
      setList(prev => {
        if (pageRows.length === 0) return prev;
        const ids = new Set(prev.map(x => x._id || x.transactionId));
        const next = pageRows.filter(x => !ids.has(x._id || x.transactionId));
        return next.length ? [...prev, ...next] : prev;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, data]);

  const onRefresh = useCallback(() => {
    setPage(1);
    refetch();
  }, [refetch]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && !isLoading) setPage(p => p + 1);
  }, [loadingMore, hasMore, isLoading]);

  const renderItem = useCallback(
    ({ item }: { item: WalletTransaction }) => {
      const cur = item.currency || 'USD';
      const credit = item.isRefund === true;
      const amt = Math.abs(item.amount);
      const pill = pillColors(item, theme);
      const bookingRef =
        typeof item.bookingId === 'object' && item.bookingId?.bookingId
          ? item.bookingId.bookingId
          : null;
      return (
        <View style={styles.card}>
          <View style={styles.cardInner}>
            <View style={styles.cardMain}>
              <View style={styles.cardTitleBlock}>
                <CustomText style={styles.desc} numberOfLines={3}>
                  {item.description || item.paymentType || '—'}
                </CustomText>
                {bookingRef ? (
                  <CustomText style={styles.bookingRef}>{bookingRef}</CustomText>
                ) : null}
              </View>
              <CustomText
                style={[
                  styles.amount,
                  credit ? styles.amountCredit : styles.amountDebit,
                ]}
              >
                {credit ? '+' : '−'}
                {formatAmount(amt, cur)}
              </CustomText>
            </View>
            <CustomText style={styles.dateMuted}>{formatDate(item.createdAt)}</CustomText>
            <View style={[styles.pill, { backgroundColor: pill.bg }]}>
              <CustomText style={[styles.pillText, { color: pill.color }]}>
                {statusLabel(item, t)}
              </CustomText>
            </View>
            {item.paymentMethod ? (
              <View style={styles.metaRow}>
                <VectoreIcons
                  name="pricetag-outline"
                  icon="Ionicons"
                  size={theme.SF(14)}
                  color={theme.colors.lightText || '#94a3b8'}
                />
                <CustomText style={styles.metaText}>
                  {item.paymentMethod}
                  {item.paymentGateway ? ` · ${item.paymentGateway}` : ''}
                </CustomText>
              </View>
            ) : null}
          </View>
        </View>
      );
    },
    [styles, t, theme],
  );

  const ListHeader = useMemo(
    () => (
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeType === 'booking' && styles.tabActive]}
          onPress={() => setActiveType('booking')}
          activeOpacity={0.75}
        >
          <CustomText
            style={[styles.tabText, activeType === 'booking' && styles.tabTextActive]}
          >
            {t('transactions.tabBooking')}
          </CustomText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeType === 'additional_addon' && styles.tabActive]}
          onPress={() => setActiveType('additional_addon')}
          activeOpacity={0.75}
        >
          <CustomText
            style={[
              styles.tabText,
              activeType === 'additional_addon' && styles.tabTextActive,
            ]}
          >
            {t('transactions.tabAdditionalAddons')}
          </CustomText>
        </TouchableOpacity>
      </View>
    ),
    [activeType, styles, t],
  );

  return (
    <Container safeArea={true} style={styles.container}>
      <AppHeader
        title={t('transactions.title')}
        onLeftPress={() => navigation.goBack()}
        backgroundColor={theme.colors.background}
        tintColor={theme.colors.text}
        containerStyle={styles.headerPad}
      />

      {isError && list.length === 0 ? (
        <View style={styles.center}>
          <CustomText style={styles.empty}>{t('transactions.loadError')}</CustomText>
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={item => item._id || item.transactionId || String(Math.random())}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={styles.listContent}
          style={styles.flex}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.35}
          refreshControl={
            <RefreshControl
              refreshing={!!isRefetching && page === 1}
              onRefresh={onRefresh}
              colors={[theme.colors.primary || '#135D96']}
              tintColor={theme.colors.primary}
            />
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footer}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            isLoading && page === 1 ? (
              <View style={styles.center}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>
            ) : (
              <View style={styles.infoBanner}>
                <VectoreIcons
                  name="information-circle-outline"
                  icon="Ionicons"
                  size={theme.SF(22)}
                  color={theme.colors.primary || '#135D96'}
                />
                <CustomText style={styles.infoText}>{t('transactions.empty')}</CustomText>
              </View>
            )
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
      backgroundColor: theme.colors.background || '#F5F6F8',
    },
    headerPad: {
      paddingHorizontal: theme.SW?.(20) ?? 20,
    },
    flex: {
      flex: 1,
    },
    listContent: {
      paddingHorizontal: theme.SW?.(16) ?? 16,
      paddingBottom: SH(100),
      flexGrow: 1,
    },
    tabBar: {
      flexDirection: 'row',
      marginTop: theme.SH?.(8) ?? 8,
      marginBottom: theme.SH?.(16) ?? 16,
      backgroundColor: theme.colors.secondary ?? '#fff',
      borderRadius: theme.borderRadius?.md ?? 12,
      padding: theme.SW?.(4) ?? 4,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border || '#e5e7eb',
    },
    tab: {
      flex: 1,
      paddingVertical: theme.SH?.(12) ?? 12,
      alignItems: 'center',
      borderRadius: theme.borderRadius?.sm ?? 10,
    },
    tabActive: {
      backgroundColor: theme.colors.primary ?? '#135D96',
    },
    tabText: {
      fontSize: theme.fontSize?.sm ?? 14,
      fontFamily: theme.fonts?.SEMI_BOLD,
      color: theme.colors.text,
      textAlign: 'center',
    },
    tabTextActive: {
      color: '#fff',
    },
    card: {
      marginBottom: theme.SH?.(12) ?? 12,
      borderRadius: theme.borderRadius?.lg ?? 14,
      backgroundColor: theme.colors.secondary ?? '#fff',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border || 'rgba(0,0,0,0.06)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.07,
      shadowRadius: 8,
      elevation: 3,
      overflow: 'hidden',
    },
    cardInner: {
      padding: theme.SW?.(16) ?? 16,
    },
    cardMain: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: theme.SW?.(12) ?? 12,
      marginBottom: theme.SH?.(8) ?? 8,
    },
    cardTitleBlock: {
      flex: 1,
      minWidth: 0,
    },
    desc: {
      fontSize: theme.fontSize?.md ?? 15,
      fontFamily: theme.fonts?.SEMI_BOLD,
      color: theme.colors.text,
      lineHeight: theme.SF?.(21) ?? 21,
    },
    bookingRef: {
      marginTop: theme.SH?.(4) ?? 4,
      fontSize: theme.fontSize?.xs ?? 12,
      fontFamily: theme.fonts?.MEDIUM,
      color: theme.colors.primary || '#135D96',
    },
    amount: {
      fontSize: theme.fontSize?.lg ?? 17,
      fontFamily: theme.fonts?.BOLD,
    },
    amountCredit: {
      color: theme.colors.success || '#15803d',
    },
    amountDebit: {
      color: theme.colors.text,
    },
    dateMuted: {
      fontSize: theme.fontSize?.xs ?? 12,
      fontFamily: theme.fonts?.REGULAR,
      color: theme.colors.lightText ?? '#94a3b8',
      marginBottom: theme.SH?.(8) ?? 8,
    },
    pill: {
      alignSelf: 'flex-start',
      paddingHorizontal: theme.SW?.(12) ?? 12,
      paddingVertical: theme.SH?.(6) ?? 6,
      borderRadius: theme.borderRadius?.xl ?? 20,
      marginBottom: theme.SH?.(6) ?? 6,
    },
    pillText: {
      fontSize: theme.fontSize?.xs ?? 12,
      fontFamily: theme.fonts?.SEMI_BOLD,
      textTransform: 'capitalize',
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.SW?.(6) ?? 6,
    },
    metaText: {
      flex: 1,
      fontSize: theme.fontSize?.xs ?? 11,
      fontFamily: theme.fonts?.REGULAR,
      color: theme.colors.lightText ?? '#64748b',
    },
    infoBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.SW?.(10) ?? 10,
      padding: theme.SW?.(16) ?? 16,
      marginTop: theme.SH?.(12) ?? 12,
      borderRadius: theme.borderRadius?.md ?? 12,
      backgroundColor: 'rgba(19, 93, 150, 0.08)',
    },
    infoText: {
      flex: 1,
      fontSize: theme.fontSize?.sm ?? 13,
      color: theme.colors.text,
      lineHeight: theme.SF?.(18) ?? 18,
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.SW?.(24) ?? 24,
    },
    empty: {
      fontSize: theme.fontSize?.md ?? 15,
      color: theme.colors.lightText ?? '#888',
      textAlign: 'center',
    },
    footer: {
      paddingVertical: theme.SH?.(16) ?? 16,
      alignItems: 'center',
    },
  });
