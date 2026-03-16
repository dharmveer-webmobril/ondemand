import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Container, AppHeader, CustomText } from '@components/common';
import { WithdrawRequestForm } from '@components';
import { useThemeContext } from '@utils/theme';
import {
  useGetWallet,
  useGetWalletTransactions,
  useGetSettlementRequests,
  useRequestWalletSettlement,
  type WalletTransaction,
  type WithdrawRequestItem,
} from '@services/api/queries/appQueries';
import { queryClient } from '@services/api';
import { handleApiError, handleSuccessToast } from '@utils/apiHelpers';
import { SH } from '@utils/dimensions';
import SCREEN_NAMES from '@navigation/ScreenNames';
import type { WithdrawRequestFormValues } from '@utils/validationSchemas';

const PAGE_SIZE = 10;
const WITHDRAW_PAGE_SIZE = 10;
const TABS = [
  { key: 'transactions' as const, labelKey: 'wallet.tabTransactions' },
  { key: 'withdraw' as const, labelKey: 'wallet.tabWithdraw' },
];
const STATUS_FILTERS = [
  { key: 'all', labelKey: 'wallet.filterAll' },
  { key: 'completed', labelKey: 'wallet.filterCompleted' },
  { key: 'processing', labelKey: 'wallet.filterProcessing' },
  { key: 'failed', labelKey: 'wallet.filterFailed' },
  { key: 'refunded', labelKey: 'wallet.filterRefunded' },
];
const WITHDRAW_STATUS_FILTERS = [
  { key: 'all', labelKey: 'wallet.filterAll' },
  { key: 'pending', labelKey: 'wallet.filterPending' },
  { key: 'approved', labelKey: 'wallet.filterApproved' },
  { key: 'rejected', labelKey: 'wallet.filterRejected' },
  { key: 'processed', labelKey: 'wallet.filterProcessed' },
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
      <CustomText style={styles.transactionDesc}>
        {item.description || item.paymentType || 'Transaction'}
      </CustomText>
      <CustomText style={styles.transactionAmount}>
        {/* {isCredit ? '+' : '-'} */}
        {formatAmount(Math.abs(item.amount), currency)}
      </CustomText>
      <CustomText style={styles.transactionDate}>{formatDate(item.createdAt)}</CustomText>
      <View style={styles.statusBadge}>
        <CustomText style={[styles.statusText, { color: statusColor }]}>{item.status}</CustomText>
      </View>
    </View>
  );
}

function WithdrawRequestCard({
  item,
  theme,
  styles,
}: {
  item: WithdrawRequestItem;
  theme: any;
  styles: ReturnType<typeof createStyles>;
}) {
  const statusColor = getStatusColor(item.status, theme);
  const currency = item.currency || 'USD';
  return (
    <View style={styles.transactionCard}>
      <CustomText style={styles.transactionDesc}>
        {item.bankDetails?.bankName || 'Withdraw'}
      </CustomText>
      <CustomText style={styles.transactionAmount}>
        {/* -{formatAmount(item.amount, currency)} */}
        {formatAmount(Math.abs(item.amount), currency)}
      </CustomText>
      <CustomText style={styles.transactionDate}>{formatDate(item.createdAt)}</CustomText>
      <View style={styles.statusBadge}>
        <CustomText style={[styles.statusText, { color: statusColor }]}>{item.status}</CustomText>
      </View>
    </View>
  );
}

export default function WalletScreen() {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [activeTab, setActiveTab] = useState<'transactions' | 'withdraw'>('transactions');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [transactionsList, setTransactionsList] = useState<WalletTransaction[]>([]);
  const [withdrawPage, setWithdrawPage] = useState(1);
  const [withdrawList, setWithdrawList] = useState<WithdrawRequestItem[]>([]);
  const [withdrawStatusFilter, setWithdrawStatusFilter] = useState<string>('all');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
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
  console.log('transactionsData------ 165', transactionsData);

  const {
    data: settlementData,
    isLoading: loadingSettlement,
    isFetching: fetchingSettlement,
    refetch: refetchSettlement,
  } = useGetSettlementRequests({
    page: activeTab === 'withdraw' ? withdrawPage : 1,
    limit: WITHDRAW_PAGE_SIZE,
    status: withdrawStatusFilter === 'all' ? undefined : withdrawStatusFilter,
    enabled: activeTab === 'withdraw',
  });
  const { mutateAsync: requestWithdraw, isPending: submittingWithdraw } = useRequestWalletSettlement();

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

  const rawWithdrawData =
    settlementData?.ResponseData?.data ??
    settlementData?.ResponseData?.requests ??
    (Array.isArray(settlementData?.ResponseData) ? settlementData?.ResponseData : []);
  const pageWithdraws = (rawWithdrawData as WithdrawRequestItem[]) || [];
  const withdrawTotalPages = settlementData?.ResponseData?.totalPages ?? 0;
  const withdrawHasMore =
    pageWithdraws.length >= WITHDRAW_PAGE_SIZE ||
    (withdrawTotalPages > 0 && withdrawPage < withdrawTotalPages);
  const loadingMoreWithdraw = fetchingSettlement && withdrawPage > 1;

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

  useEffect(() => {
    if (activeTab !== 'withdraw') return;
    if (withdrawPage === 1) {
      setWithdrawList(pageWithdraws);
    } else {
      setWithdrawList((prev) => {
        if (pageWithdraws.length === 0) return prev;
        const ids = new Set(prev.map((x) => x._id));
        const newItems = pageWithdraws.filter((x) => !ids.has(x._id));
        return newItems.length ? [...prev, ...newItems] : prev;
      });
    }
  }, [activeTab, withdrawPage, settlementData]);

  const onRefresh = useCallback(() => {
    setPage(1);
    setWithdrawPage(1);
    refetchWallet();
    refetchTransactions();
    if (activeTab === 'withdraw') refetchSettlement();
  }, [refetchWallet, refetchTransactions, refetchSettlement, activeTab]);

  const handleWithdrawSubmit = useCallback(
    async (values: WithdrawRequestFormValues) => {
      const amt = parseFloat(values.amount);
      if (!Number.isFinite(amt) || amt <= 0) return;
      try {
        await requestWithdraw({
          amount: amt,
          bankDetails: {
            accountNumber: values.accountNumber.trim(),
            accountHolderName: values.accountHolderName.trim(),
            bankName: values.bankName.trim(),
            ifscCode: values.ifscCode.trim(),
          },
        });
        handleSuccessToast(t('wallet.withdrawRequestSuccess'));
        setShowWithdrawModal(false);
        setWithdrawPage(1);
        setWithdrawList([]);
        queryClient.invalidateQueries({ queryKey: ['customerWallet'] });
        refetchWallet();
        refetchSettlement();
      } catch (err) {
        handleApiError(err);
      }
    },
    [requestWithdraw, refetchWallet, refetchSettlement, t]
  );

  const loadMoreWithdraw = useCallback(() => {
    if (!loadingMoreWithdraw && withdrawHasMore && !loadingSettlement) {
      setWithdrawPage((p) => p + 1);
    }
  }, [loadingMoreWithdraw, withdrawHasMore, loadingSettlement]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loadingTransactions) setPage((p) => p + 1);
  }, [loadingMore, hasMore, loadingTransactions]);

  const handleFilterChange = useCallback((key: string) => {
    setStatusFilter(key);
    setPage(1);
    setTransactionsList([]);
  }, []);

  const handleWithdrawFilterChange = useCallback((key: string) => {
    setWithdrawStatusFilter(key);
    setWithdrawPage(1);
    setWithdrawList([]);
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

      {/* Wallet summary at top: left = balance content, right = Make request button */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceCardLeft}>
          <CustomText style={styles.balanceLabel}>{t('wallet.totalBalance')}</CustomText>
          {loadingWallet ? (
            <ActivityIndicator size="small" color="#fff" style={styles.balanceLoader} />
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
        <TouchableOpacity
          style={styles.balanceCardRightBtn}
          onPress={() => setShowWithdrawModal(true)}
          activeOpacity={0.8}
        >
          <CustomText style={styles.balanceCardRightBtnText}>{t('wallet.makeRequest')}</CustomText>
        </TouchableOpacity>
      </View>

      {/* Tabs: Transactions | Withdraw */}
      <View style={styles.tabWrap}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => {
              setActiveTab(tab.key);
              if (tab.key === 'withdraw') {
                setWithdrawPage(1);
                setWithdrawList([]);
              }
            }}
            activeOpacity={0.7}
          >
            <CustomText
              style={activeTab === tab.key ? [styles.tabText, styles.tabTextActive] : styles.tabText}
            >
              {t(tab.labelKey)}
            </CustomText>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'transactions' && (
        <>
          {/* Filter by status */}
          {/* <View style={styles.filterWrap}>
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
          </View> */}

          {/* Transaction list with load more */}
          <View style={styles.listWrap}>
            {/* <CustomText style={styles.sectionTitle}>{t('wallet.transactions')}</CustomText> */}
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
        </>
      )}

      {activeTab === 'withdraw' && (
        <ScrollView
          style={styles.withdrawScroll}
          contentContainerStyle={styles.withdrawScrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Withdraw status filter */}
          <View style={styles.filterWrap}>
            <FlatList
              horizontal
              data={WITHDRAW_STATUS_FILTERS}
              keyExtractor={(item) => item.key}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterList}
              renderItem={({ item }) => {
                const isActive = withdrawStatusFilter === item.key;
                return (
                  <TouchableOpacity
                    style={[styles.filterChip, isActive ? styles.filterChipActive : null]}
                    onPress={() => handleWithdrawFilterChange(item.key)}
                    activeOpacity={0.7}
                  >
                    <CustomText
                      style={isActive ? [styles.filterChipText, styles.filterChipTextActive] : styles.filterChipText}
                    >
                      {t(item.labelKey)}
                    </CustomText>
                  </TouchableOpacity>
                );
              }}
            />
          </View>

          {/* <CustomText style={[styles.sectionTitle, styles.withdrawListTitle]}>
            {t('wallet.withdrawHistory')}
          </CustomText> */}
          {loadingSettlement && withdrawPage === 1 ? (
            <View style={styles.centerLoader}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : withdrawList.length === 0 ? (
            <View style={styles.emptyWrap}>
              <CustomText style={styles.emptyText}>{t('wallet.noWithdrawals')}</CustomText>
            </View>
          ) : (
            <>
              {withdrawList.map((item) => (
                <WithdrawRequestCard key={item._id} item={item} theme={theme} styles={styles} />
              ))}
              {withdrawHasMore && (
                <TouchableOpacity
                  style={styles.loadMoreWithdrawBtn}
                  onPress={loadMoreWithdraw}
                  disabled={loadingMoreWithdraw}
                >
                  {loadingMoreWithdraw ? (
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                  ) : (
                    <CustomText style={styles.loadMoreWithdrawText}>{t('wallet.loadMore')}</CustomText>
                  )}
                </TouchableOpacity>
              )}
            </>
          )}
        </ScrollView>
      )}

      <WithdrawRequestForm
        visible={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        balance={balance}
        onSubmit={handleWithdrawSubmit}
        isSubmitting={submittingWithdraw}
      />
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
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginHorizontal: theme.SW?.(20) ?? 20,
      marginTop: theme.SH?.(16) ?? 16,
      paddingVertical: theme.SH?.(20) ?? 20,
      paddingHorizontal: theme.SW?.(20) ?? 20,
      backgroundColor: theme.colors.primary || '#135D96',
      borderRadius:  theme.borderRadius?.sm ?? 6,
    },
    balanceCardLeft: {
      flex: 1,
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
    },
    balanceMetaText: {
      fontSize: theme.fontSize?.xs ?? 12,
      color: 'rgba(255,255,255,0.85)',
      fontFamily: theme.fonts?.REGULAR,
    },
    balanceCardRightBtn: {
      paddingVertical: theme.SH?.(12) ?? 12,
      paddingHorizontal: theme.SW?.(16) ?? 16,
      backgroundColor: '#fff',
      borderRadius: theme.borderRadius?.md ?? 8,
      marginLeft: theme.SW?.(16) ?? 16,
    },
    balanceCardRightBtnText: {
      fontSize: theme.fontSize?.sm ?? 14,
      fontFamily: theme.fonts?.BOLD,
      color: theme.colors.primary || '#135D96',
    },
    tabWrap: {
      flexDirection: 'row',
      marginHorizontal: theme.SW?.(20) ?? 20,
      marginTop: theme.SH?.(16) ?? 16,
      backgroundColor: theme.colors.secondary ?? '#fff',
      borderRadius: theme.borderRadius?.md ?? 8,
      padding: theme.SW?.(4) ?? 4,
    },
    tab: {
      flex: 1,
      paddingVertical: theme.SH?.(7) ?? 7,
      alignItems: 'center',
      borderRadius: theme.borderRadius?.sm ?? 6,
    },
    tabActive: {
      backgroundColor: theme.colors.primary ?? '#135D96',
    },
    tabText: {
      fontSize: theme.fontSize?.md ?? 16,
      fontFamily: theme.fonts?.MEDIUM,
      color: theme.colors.text,
    },
    tabTextActive: {
      color: '#fff',
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
      color: theme.colors.text ?? '#333',
      marginTop: theme.SH?.(4) ?? 4,
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
    withdrawScroll: {
      flex: 1,
    },
    withdrawScrollContent: {
      paddingHorizontal: theme.SW?.(20) ?? 20,
      paddingBottom: SH(90),
    },
    withdrawListTitle: {
      marginTop: theme.SH?.(24) ?? 24,
    },
    loadMoreWithdrawBtn: {
      paddingVertical: theme.SH?.(16) ?? 16,
      alignItems: 'center',
    },
    loadMoreWithdrawText: {
      fontSize: theme.fontSize?.sm ?? 14,
      color: theme.colors.primary,
      fontFamily: theme.fonts?.MEDIUM,
    },
  });
