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
import { Container, AppHeader, CustomText } from '@components/common';
import { useThemeContext } from '@utils/theme';
import { useGetWallet, useGetWalletTransactions, type WalletTransaction } from '@services/api/queries/appQueries';
import { SH } from '@utils/dimensions';
import SCREEN_NAMES from '@navigation/ScreenNames';

const PAGE_SIZE = 10;
const STATUS_FILTERS = [
  { key: 'all', labelKey: 'wallet.filterAll' },
  { key: 'completed', labelKey: 'wallet.filterCompleted' },
  { key: 'processing', labelKey: 'wallet.filterProcessing' },
  { key: 'failed', labelKey: 'wallet.filterFailed' },
  { key: 'refunded', labelKey: 'wallet.filterRefunded' },
];

function formatDate(dateString: string): string {
  if (!dateString) return '—';
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
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

function getStatusColor(status: string, theme: any): string {
  const s = (status || '').toLowerCase();
  if (s === 'completed' || s === 'success') return theme.colors.success || '#22c55e';
  if (s === 'processing' || s === 'pending') return theme.colors.warning || '#eab308';
  if (s === 'failed' || s === 'cancelled') return theme.colors.error || '#ef4444';
  if (s === 'refunded') return theme.colors.primary || '#135D96';
  return theme.colors.text || '#333';
}

function TransactionItem({
  item,
  theme,
  styles,
}: {
  item: WalletTransaction;
  theme: any;
  styles: ReturnType<typeof createStyles>;
}) {
  const statusColor = getStatusColor(item.status, theme);
  const isCredit = item.isRefund === true;
  const currency = item.currency || 'USD';
  return (
    <View style={styles.transactionCard}>
      <View style={styles.transactionRow}>
        <View style={styles.transactionLeft}>
          <CustomText style={styles.transactionDesc} numberOfLines={1}>
            {item.description || item.paymentType || 'Transaction'}
          </CustomText>
          <CustomText style={styles.transactionDate}>{formatDate(item.createdAt)}</CustomText>
          <View style={styles.statusBadge}>
            <CustomText style={[styles.statusText, { color: statusColor }]}>{item.status}</CustomText>
          </View>
        </View>
        <CustomText
          style={[
            styles.transactionAmount,
            isCredit ? styles.amountCredit : styles.amountDebit,
          ]}
        >
          {isCredit ? '+' : '-'}{formatAmount(Math.abs(item.amount), currency)}
        </CustomText>
      </View>
    </View>
  );
}

export default function WalletScreen() {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [transactionsList, setTransactionsList] = useState<WalletTransaction[]>([]);
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const { data: walletData, isLoading: loadingWallet, refetch: refetchWallet } = useGetWallet();
  const {
    data: transactionsData,
    isLoading: loadingTransactions,
    isError: transactionsError,
    refetch: refetchTransactions,
    isRefetching,
    isFetching,
  } = useGetWalletTransactions({
    page,
    limit: PAGE_SIZE,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const res = walletData?.ResponseData;
  const balance = Number(res?.balance ?? res?.amount ?? 0) || 0;
  const currency = res?.currency ?? 'USD';
  const totalCredited = Number(res?.totalCredited ?? 0) || 0;
  const totalUsed = Number(res?.totalUsed ?? 0) || 0;

  const rawPageData =
    transactionsData?.ResponseData?.data ??
    transactionsData?.ResponseData?.transactions ??
    (Array.isArray(transactionsData?.ResponseData) ? transactionsData?.ResponseData : []);
  const pageTransactions = (rawPageData as WalletTransaction[]) || [];
  const totalPages = transactionsData?.ResponseData?.totalPages ?? 0;
  const hasMore = pageTransactions.length >= PAGE_SIZE || (totalPages > 0 && page < totalPages);
  const loadingMore = isFetching && page > 1;

  useEffect(() => {
    if (page === 1) {
      setTransactionsList(pageTransactions);
    } else {
      setTransactionsList((prev) => {
        if (pageTransactions.length === 0) return prev;
        const ids = new Set(prev.map((x) => x._id || x.transactionId));
        const newItems = pageTransactions.filter((x) => !ids.has(x._id || x.transactionId));
        return newItems.length ? [...prev, ...newItems] : prev;
      });
    }
  }, [page, transactionsData]);

  const onRefresh = useCallback(() => {
    setPage(1);
    refetchWallet();
    refetchTransactions();
  }, [refetchWallet, refetchTransactions]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loadingTransactions) setPage((p) => p + 1);
  }, [loadingMore, hasMore, loadingTransactions]);

  const handleFilterChange = useCallback((key: string) => {
    setStatusFilter(key);
    setPage(1);
    setTransactionsList([]);
  }, []);

  const renderTransaction = useCallback(
    ({ item }: { item: WalletTransaction }) => (
      <TransactionItem item={item} theme={theme} styles={styles} />
    ),
    [theme, styles],
  );

  const renderFooter = () =>
    loadingMore ? (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    ) : null;

  return (
    <Container safeArea={true} style={styles.container}>
      <AppHeader
        title={t('wallet.title')}
        onLeftPress={() => navigation.goBack()}
        backgroundColor={theme.colors.background}
        tintColor={theme.colors.text}
        containerStyle={{paddingHorizontal:20}}
      />

      {/* Wallet summary at top */}
      <View style={styles.balanceCard}>
        <CustomText style={styles.balanceLabel}>{t('wallet.totalBalance')}</CustomText>
        {loadingWallet ? (
          <ActivityIndicator size="small" color={theme.colors.primary} style={styles.balanceLoader} />
        ) : (
          <CustomText style={styles.balanceAmount}>{formatAmount(balance, currency)}</CustomText>
        )}
        {!loadingWallet && (totalCredited > 0 || totalUsed > 0) && (
          <View style={styles.balanceMeta}>
            <CustomText style={styles.balanceMetaText}>
              {t('wallet.totalCredited')}: {formatAmount(totalCredited, currency)}
            </CustomText>
            <CustomText style={styles.balanceMetaText}>
              {t('wallet.totalUsed')}: {formatAmount(totalUsed, currency)}
            </CustomText>
          </View>
        )}
      </View>

      {/* Filter by status */}
      <View style={styles.filterWrap}>
        <FlatList
          horizontal
          data={STATUS_FILTERS}
          keyExtractor={(item) => item.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => {
            const isActive = statusFilter === item.key;
            return (
              <TouchableOpacity
                style={[styles.filterChip, isActive ? styles.filterChipActive : null]}
                onPress={() => handleFilterChange(item.key)}
                activeOpacity={0.7}
              >
                <CustomText style={isActive ? [styles.filterChipText, styles.filterChipTextActive] : styles.filterChipText}>
                  {t(item.labelKey)}
                </CustomText>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Transaction list with load more */}
      <View style={styles.listWrap}>
        <CustomText style={styles.sectionTitle}>{t('wallet.transactions')}</CustomText>
        {loadingTransactions && page === 1 ? (
          <View style={styles.centerLoader}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : transactionsError ? (
          <View style={styles.emptyWrap}>
            <CustomText style={styles.emptyText}>{t('wallet.noTransactions')}</CustomText>
            <CustomText style={styles.emptySubtext}>{t('wallet.loadError')}</CustomText>
          </View>
        ) : transactionsList.length === 0 ? (
          <View style={styles.emptyWrap}>
            <CustomText style={styles.emptyText}>{t('wallet.noTransactions')}</CustomText>
          </View>
        ) : (
          <FlatList
            data={transactionsList}
            keyExtractor={(item) => item._id || item.transactionId || String(Math.random())}
            renderItem={renderTransaction}
            contentContainerStyle={styles.transactionList}
            showsVerticalScrollIndicator={false}
            onEndReached={loadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={renderFooter}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching && page === 1}
                onRefresh={onRefresh}
                colors={[theme.colors.primary]}
              />
            }
          />
        )}
      </View>
    </Container>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background || '#F7F7F7',
    },
    balanceCard: {
      marginHorizontal: theme.SW?.(20) ?? 20,
      marginTop: theme.SH?.(16) ?? 16,
      paddingVertical: theme.SH?.(24) ?? 24,
      paddingHorizontal: theme.SW?.(20) ?? 20,
      backgroundColor: theme.colors.primary || '#135D96',
      borderRadius: theme.borderRadius?.lg ?? 12,
      alignItems: 'center',
    },
    balanceLabel: {
      fontSize: theme.fontSize?.sm ?? 14,
      color: 'rgba(255,255,255,0.9)',
      fontFamily: theme.fonts?.REGULAR,
      marginBottom: theme.SH?.(4) ?? 4,
    },
    balanceAmount: {
      fontSize: theme.fontSize?.xxl ?? 24,
      fontFamily: theme.fonts?.BOLD,
      color: '#fff',
    },
    balanceLoader: {
      marginTop: 4,
    },
    balanceMeta: {
      marginTop: theme.SH?.(12) ?? 12,
      alignItems: 'center',
    },
    balanceMetaText: {
      fontSize: theme.fontSize?.xs ?? 12,
      color: 'rgba(255,255,255,0.85)',
      fontFamily: theme.fonts?.REGULAR,
    },
    filterWrap: {
      marginTop: theme.SH?.(20) ?? 20,
    },
    filterList: {
      paddingHorizontal: theme.SW?.(20) ?? 20,
      gap: theme.SW?.(8) ?? 8,
      paddingBottom: theme.SH?.(8) ?? 8,
    },
    filterChip: {
      paddingHorizontal: theme.SW?.(16) ?? 16,
      paddingVertical: theme.SH?.(8) ?? 8,
      borderRadius: theme.borderRadius?.xl ?? 20,
      backgroundColor: theme.colors.secondary ?? '#fff',
      marginRight: theme.SW?.(8) ?? 8,
    },
    filterChipActive: {
      backgroundColor: theme.colors.primary ?? '#135D96',
    },
    filterChipText: {
      fontSize: theme.fontSize?.sm ?? 14,
      color: theme.colors.text,
      fontFamily: theme.fonts?.MEDIUM,
    },
    filterChipTextActive: {
      color: '#fff',
    },
    listWrap: {
      flex: 1,
      marginTop: theme.SH?.(8) ?? 8,
      paddingHorizontal: theme.SW?.(20) ?? 20,
    },
    sectionTitle: {
      fontSize: theme.fontSize?.md ?? 16,
      fontFamily: theme.fonts?.BOLD,
      color: theme.colors.text,
      marginBottom: theme.SH?.(12) ?? 12,
    },
    transactionList: {
      paddingBottom: SH(90),
    },
    transactionCard: {
      backgroundColor: theme.colors.secondary ?? '#fff',
      borderRadius: theme.borderRadius?.md ?? 8,
      padding: theme.SW?.(16) ?? 16,
      marginBottom: theme.SH?.(12) ?? 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 2,
      elevation: 2,
    },
    transactionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    transactionLeft: {
      flex: 1,
    },
    transactionDesc: {
      fontSize: theme.fontSize?.md ?? 16,
      fontFamily: theme.fonts?.MEDIUM,
      color: theme.colors.text,
    },
    transactionDate: {
      fontSize: theme.fontSize?.xs ?? 12,
      color: theme.colors.lightText ?? '#888',
      marginTop: theme.SH?.(4) ?? 4,
    },
    statusBadge: {
      marginTop: theme.SH?.(6) ?? 6,
    },
    statusText: {
      fontSize: theme.fontSize?.xs ?? 12,
      fontFamily: theme.fonts?.MEDIUM,
      textTransform: 'capitalize',
    },
    transactionAmount: {
      fontSize: theme.fontSize?.md ?? 16,
      fontFamily: theme.fonts?.BOLD,
    },
    amountCredit: {
      color: theme.colors.success ?? '#22c55e',
    },
    amountDebit: {
      color: theme.colors.error ?? '#ef4444',
    },
    centerLoader: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 200,
    },
    emptyWrap: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 200,
    },
    emptyText: {
      fontSize: theme.fontSize?.md ?? 16,
      color: theme.colors.lightText ?? '#888',
      fontFamily: theme.fonts?.REGULAR,
    },
    emptySubtext: {
      fontSize: theme.fontSize?.sm ?? 14,
      color: theme.colors.lightText ?? '#888',
      fontFamily: theme.fonts?.REGULAR,
      marginTop: theme.SH?.(8) ?? 8,
    },
    footerLoader: {
      paddingVertical: theme.SH?.(16) ?? 16,
      alignItems: 'center',
    },
  });
