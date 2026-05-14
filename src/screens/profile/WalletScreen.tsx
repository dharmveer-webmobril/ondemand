import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import {
  Container,
  AppHeader,
  CustomText,
  VectoreIcons,
} from '@components/common';
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
import type { WithdrawRequestFormValues } from '@utils/validationSchemas';

const PAGE_SIZE = 10;
const SETTLEMENT_PAGE_SIZE = 10;

type WalletTab = 'transactions' | 'settlements';

const SETTLEMENT_FILTERS = [
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

function extractTransactionRows(resp: any): WalletTransaction[] {
  const rd = resp?.ResponseData;
  if (Array.isArray(rd)) return rd as WalletTransaction[];
  if (Array.isArray(rd?.data)) return rd.data as WalletTransaction[];
  if (Array.isArray(rd?.transactions))
    return rd.transactions as WalletTransaction[];
  return [];
}

function extractSettlementRows(resp: any): WithdrawRequestItem[] {
  const rd = resp?.ResponseData;
  if (Array.isArray(rd)) return rd as WithdrawRequestItem[];
  if (Array.isArray(rd?.data)) return rd.data as WithdrawRequestItem[];
  if (Array.isArray(rd?.requests)) return rd.requests as WithdrawRequestItem[];
  return [];
}

function txPages(resp: any): number {
  const p = resp?.pagination;
  if (p?.pages != null) return Math.max(0, Number(p.pages));
  const rd = resp?.ResponseData;
  if (typeof rd?.totalPages === 'number') return rd.totalPages;
  return 0;
}

function settlementPages(resp: any): number {
  const p = resp?.pagination;
  if (p?.pages != null) return Math.max(0, Number(p.pages));
  const rd = resp?.ResponseData;
  if (typeof rd?.totalPages === 'number') return rd.totalPages;
  return 0;
}

function statusLabel(
  item: WalletTransaction,
  t: (k: string) => string,
): string {
  if (item.isRefund) return t('wallet.statusRefund');
  const s = (item.status || '').toLowerCase();
  if (s === 'completed') return t('wallet.filterCompleted');
  return item.status || '—';
}

function txPillStyle(item: WalletTransaction, theme: any) {
  if (item.isRefund)
    return {
      bg: 'rgba(19, 93, 150, 0.12)',
      color: theme.colors.primary || '#135D96',
    };
  return settlementStatusStyle(item.status, theme);
}

function settlementStatusStyle(status: string, theme: any) {
  const s = (status || '').toLowerCase();
  if (s === 'approved' || s === 'processed' || s === 'completed')
    return {
      bg: 'rgba(34,197,94,0.12)',
      color: theme.colors.success || '#16a34a',
    };
  if (s === 'pending')
    return {
      bg: 'rgba(234,179,8,0.15)',
      color: theme.colors.warning || '#ca8a04',
    };
  if (s === 'rejected' || s === 'failed')
    return {
      bg: 'rgba(239,68,68,0.12)',
      color: theme.colors.error || '#dc2626',
    };
  return {
    bg: 'rgba(19,93,150,0.12)',
    color: theme.colors.primary || '#135D96',
  };
}

type FieldRowProps = {
  icon: string;
  label: string;
  value: string;
  theme: any;
  styles: any;
  isLast?: boolean;
};

function SettlementFieldRow({
  icon,
  label,
  value,
  theme,
  styles,
  isLast,
}: FieldRowProps) {
  return (
    <View
      style={[styles.settlementField, isLast && styles.settlementFieldLast]}
    >
      <View style={styles.settlementFieldIcon}>
        <VectoreIcons
          name={icon}
          icon="Ionicons"
          size={theme.SF(18)}
          color={theme.colors.primary || '#135D96'}
        />
      </View>
      <View style={styles.settlementFieldBody}>
        <CustomText style={styles.settlementFieldLabel}>{label}</CustomText>
        <CustomText style={styles.settlementFieldValue} numberOfLines={3}>
          {value}
        </CustomText>
      </View>
    </View>
  );
}

export default function WalletScreen() {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const [activeTab, setActiveTab] = useState<WalletTab>('transactions');
  const [page, setPage] = useState(1);
  const [transactionsList, setTransactionsList] = useState<WalletTransaction[]>(
    [],
  );
  const [settlementPage, setSettlementPage] = useState(1);
  const [settlementList, setSettlementList] = useState<WithdrawRequestItem[]>(
    [],
  );
  const [settlementStatusFilter, setSettlementStatusFilter] =
    useState<string>('all');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const {
    data: walletData,
    isLoading: loadingWallet,
    refetch: refetchWallet,
  } = useGetWallet();

  const {
    data: transactionsData,
    isLoading: loadingTransactions,
    isError: transactionsError,
    refetch: refetchTransactions,
    isRefetching: isRefetchingTx,
    isFetching,
  } = useGetWalletTransactions({
    page,
    limit: PAGE_SIZE,
  });

  const {
    data: settlementData,
    isLoading: loadingSettlement,
    isFetching: fetchingSettlement,
    isRefetching: isRefetchingSettlement,
    refetch: refetchSettlement,
  } = useGetSettlementRequests({
    page: settlementPage,
    limit: SETTLEMENT_PAGE_SIZE,
    status:
      settlementStatusFilter === 'all' ? undefined : settlementStatusFilter,
  });

  const { mutateAsync: requestWithdraw, isPending: submittingWithdraw } =
    useRequestWalletSettlement();

  const res = walletData?.ResponseData;
  const currency = res?.currency ?? 'USD';
  const balance = Number(res?.balance ?? res?.totalBalance ?? 0) || 0;
  const withdrawable =
    Number(
      res?.withdrawableBalance ?? res?.withdrawableAmount ?? res?.balance ?? 0,
    ) || 0;
  const totalCredited = Number(res?.totalCredited ?? 0) || 0;
  const totalUsed = Number(res?.totalUsed ?? 0) || 0;
  const totalSettled = Number(res?.totalSettled ?? 0) || 0;
  const pendingSettlement = Number(res?.pendingSettlementAmount ?? 0) || 0;

  const pageTransactions = extractTransactionRows(transactionsData);
  const txTotalPages = txPages(transactionsData);
  const hasMoreTx =
    txTotalPages > 0
      ? page < txTotalPages
      : pageTransactions.length >= PAGE_SIZE;
  const loadingMoreTx = isFetching && page > 1;

  const pageSettlements = extractSettlementRows(settlementData);
  const settlementTotalPages = settlementPages(settlementData);
  const hasMoreSettlement =
    settlementTotalPages > 0
      ? settlementPage < settlementTotalPages
      : pageSettlements.length >= SETTLEMENT_PAGE_SIZE;
  const loadingMoreSettlement = fetchingSettlement && settlementPage > 1;

  useEffect(() => {
    if (page === 1) {
      setTransactionsList(pageTransactions);
    } else {
      setTransactionsList(prev => {
        if (pageTransactions.length === 0) return prev;
        const ids = new Set(prev.map(x => x._id || x.transactionId));
        const next = pageTransactions.filter(
          x => !ids.has(x._id || x.transactionId),
        );
        return next.length ? [...prev, ...next] : prev;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, transactionsData]);

  useEffect(() => {
    if (settlementPage === 1) {
      setSettlementList(pageSettlements);
    } else {
      setSettlementList(prev => {
        if (pageSettlements.length === 0) return prev;
        const ids = new Set(prev.map(x => x._id));
        const next = pageSettlements.filter(x => !ids.has(x._id));
        return next.length ? [...prev, ...next] : prev;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settlementPage, settlementData]);

  const onRefresh = useCallback(() => {
    setPage(1);
    setSettlementPage(1);
    refetchWallet();
    refetchTransactions();
    refetchSettlement();
  }, [refetchWallet, refetchTransactions, refetchSettlement]);

  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [onRefresh]),
  );

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
        setSettlementPage(1);
        setSettlementList([]);
        queryClient.invalidateQueries({ queryKey: ['customerWallet'] });
        queryClient.invalidateQueries({
          queryKey: ['customerSettlementRequests'],
        });
        refetchWallet();
        refetchSettlement();
        setActiveTab('settlements');
      } catch (err) {
        handleApiError(err);
      }
    },
    [requestWithdraw, refetchWallet, refetchSettlement, t],
  );

  const loadMoreTx = useCallback(() => {
    if (
      !loadingMoreTx &&
      hasMoreTx &&
      !loadingTransactions &&
      activeTab === 'transactions'
    ) {
      setPage(p => p + 1);
    }
  }, [loadingMoreTx, hasMoreTx, loadingTransactions, activeTab]);

  const loadMoreSettlement = useCallback(() => {
    if (
      !loadingMoreSettlement &&
      hasMoreSettlement &&
      !loadingSettlement &&
      activeTab === 'settlements'
    ) {
      setSettlementPage(p => p + 1);
    }
  }, [loadingMoreSettlement, hasMoreSettlement, loadingSettlement, activeTab]);

  const handleSettlementFilterChange = useCallback((key: string) => {
    setSettlementStatusFilter(key);
    setSettlementPage(1);
    setSettlementList([]);
  }, []);

  const renderTransaction = useCallback(
    ({ item }: { item: WalletTransaction }) => {
      const cur = item.currency || currency;
      const credit = item.isRefund === true || item.amount > 0;
      const amt = Math.abs(item.amount);
      const pillStyle = txPillStyle(item, theme);
      return (
        <View style={styles.txCard}>
          <View style={styles.txCardInner}>
            <View style={styles.txCardMain}>
              <CustomText style={styles.txDescBold} numberOfLines={3}>
                {item.description || item.paymentType || '—'}
              </CustomText>
              <CustomText
                style={[
                  styles.txAmountHero,
                  credit ? styles.txAmountCredit : styles.txAmountDebit,
                ]}
              >
                {/* {credit ? '+' : '−'} */}
                {item.status === 'completed' && item.isRefund && '+'}
                {item.status === 'completed' && !item.isRefund && '-'}{' '}
                {formatAmount(amt, cur)}
              </CustomText>
            </View>
            <CustomText style={styles.txDateMuted}>
              {formatDate(item.createdAt)}
            </CustomText>
            <View
              style={[styles.statusPill, { backgroundColor: pillStyle.bg }]}
            >
              <CustomText
                style={[styles.statusPillText, { color: pillStyle.color }]}
              >
                {statusLabel(item, t)}
              </CustomText>
            </View>
          </View>
        </View>
      );
    },
    [currency, theme, styles, t],
  );

  const renderSettlementItem = useCallback(
    ({ item }: { item: WithdrawRequestItem }) => {
      const cur = item.currency || currency;
      const ext = item as WithdrawRequestItem & {
        requestId?: string;
        requestedAt?: string;
      };
      const reqAt = ext.requestedAt || item.createdAt;
      const st = settlementStatusStyle(item.status, theme);
      const bd = item.bankDetails;

      return (
        <View style={styles.settlementCard}>
          <View style={[styles.settlementHero, { borderLeftColor: st.color }]}>
            <View style={styles.settlementHeroTop}>
              <View style={styles.settlementAmountBlock}>
                <CustomText style={styles.settlementAmountCaption}>
                  {t('wallet.amount')}
                </CustomText>
                <CustomText style={styles.settlementAmountHero}>
                  {formatAmount(Math.abs(item.amount), cur)}
                </CustomText>
              </View>
              <View
                style={[styles.settlementHeroPill, { backgroundColor: st.bg }]}
              >
                <CustomText
                  style={[styles.settlementHeroPillText, { color: st.color }]}
                >
                  {item.status || '—'}
                </CustomText>
              </View>
            </View>

            <View style={styles.settlementMetaRow}>
              <VectoreIcons
                name="time-outline"
                icon="Ionicons"
                size={theme.SF(15)}
                color={theme.colors.lightText || '#64748b'}
              />
              <CustomText style={styles.settlementMetaText}>
                {formatDate(reqAt)}
              </CustomText>
            </View>

            {ext.requestId ? (
              <View style={styles.settlementIdCard}>
                <CustomText style={styles.settlementIdLabel}>
                  {t('wallet.requestId')}
                </CustomText>
                <CustomText style={styles.settlementIdValue} selectable>
                  {ext.requestId}
                </CustomText>
              </View>
            ) : null}
          </View>

          <View style={styles.settlementBankSection}>
            <CustomText style={styles.settlementSectionTitle}>
              {t('wallet.bankDetailsSection')}
            </CustomText>
            <SettlementFieldRow
              icon="business-outline"
              label={t('wallet.bankName')}
              value={bd?.bankName || '—'}
              theme={theme}
              styles={styles}
            />
            <SettlementFieldRow
              icon="person-outline"
              label={t('wallet.accountHolderName')}
              value={bd?.accountHolderName || '—'}
              theme={theme}
              styles={styles}
            />
            <SettlementFieldRow
              icon="card-outline"
              label={t('wallet.accountNumber')}
              value={bd?.accountNumber || '—'}
              theme={theme}
              styles={styles}
            />
            <SettlementFieldRow
              icon="key-outline"
              label={t('wallet.ifscCode')}
              value={bd?.ifscCode || '—'}
              theme={theme}
              styles={styles}
              isLast
            />
          </View>
        </View>
      );
    },
    [currency, styles, t, theme],
  );

  const summaryRows = useMemo(
    () => [
      { labelKey: 'wallet.statsTotalCredited', value: totalCredited },
      { labelKey: 'wallet.statsWithdrawable', value: withdrawable },
      { labelKey: 'wallet.statsTotalUsed', value: totalUsed },
      { labelKey: 'wallet.statsTotalWithdrawn', value: totalSettled },
      { labelKey: 'wallet.statsPendingSettlement', value: pendingSettlement },
    ],
    [totalCredited, withdrawable, totalUsed, totalSettled, pendingSettlement],
  );

  const ListHeaderShared = useMemo(
    () => (
      <>
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.heroLeft}>
              <View style={styles.heroIconWrap}>
                <VectoreIcons
                  name="wallet-outline"
                  icon="Ionicons"
                  size={theme.SF(28)}
                  color="#fff"
                />
              </View>
              <View style={styles.heroTextCol}>
                <CustomText style={styles.heroLabel}>
                  {t('wallet.availableBalance')}
                </CustomText>
                {loadingWallet ? (
                  <ActivityIndicator
                    size="small"
                    color="#fff"
                    style={styles.heroLoader}
                  />
                ) : (
                  <>
                    <CustomText style={styles.heroAmount}>
                      {formatAmount(balance, currency)}
                    </CustomText>
                    <CustomText style={styles.heroCurrency}>
                      {currency}
                    </CustomText>
                  </>
                )}
              </View>
            </View>
            <TouchableOpacity
              style={styles.heroCta}
              onPress={() => setShowWithdrawModal(true)}
              activeOpacity={0.85}
            >
              <VectoreIcons
                name="document-text-outline"
                icon="Ionicons"
                size={theme.SF(18)}
                color={theme.colors.primary || '#135D96'}
              />
              <CustomText style={styles.heroCtaText}>
                {t('wallet.requestWithdrawal')}
              </CustomText>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.summaryBox}>
          {summaryRows.map((row, index) => (
            <View key={row.labelKey}>
              {index > 0 ? <View style={styles.summaryDivider} /> : null}
              <View style={styles.kvRow}>
                <CustomText style={styles.kvLabel}>
                  {t(row.labelKey)}
                </CustomText>
                <CustomText style={styles.kvValue}>
                  {formatAmount(row.value, currency)}
                </CustomText>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'transactions' && styles.tabActive,
            ]}
            onPress={() => setActiveTab('transactions')}
            activeOpacity={0.75}
          >
            <CustomText
              style={[
                styles.tabText,
                activeTab === 'transactions' && styles.tabTextActive,
              ]}
            >
              {t('wallet.tabTransactions')}
            </CustomText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'settlements' && styles.tabActive,
            ]}
            onPress={() => setActiveTab('settlements')}
            activeOpacity={0.75}
          >
            <CustomText
              style={[
                styles.tabText,
                activeTab === 'settlements' && styles.tabTextActive,
              ]}
            >
              {t('wallet.tabSettlementRequests')}
            </CustomText>
          </TouchableOpacity>
        </View>
      </>
    ),
    [
      activeTab,
      balance,
      currency,
      loadingWallet,
      styles,
      summaryRows,
      t,
      theme,
    ],
  );

  const SettlementFiltersHeader = useMemo(
    () => (
      <View style={styles.filterWrap}>
        <FlatList
          horizontal
          data={SETTLEMENT_FILTERS}
          keyExtractor={item => item.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => {
            const active = settlementStatusFilter === item.key;
            return (
              <TouchableOpacity
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => handleSettlementFilterChange(item.key)}
                activeOpacity={0.75}
              >
                <CustomText
                  style={[
                    styles.filterChipText,
                    active && styles.filterChipTextActive,
                  ]}
                >
                  {t(item.labelKey)}
                </CustomText>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    ),
    [handleSettlementFilterChange, settlementStatusFilter, styles, t],
  );

  const transactionsHeader = useMemo(
    () => <>{ListHeaderShared}</>,
    [ListHeaderShared],
  );

  const settlementsHeader = useMemo(
    () => (
      <>
        {ListHeaderShared}
        {SettlementFiltersHeader}
      </>
    ),
    [ListHeaderShared, SettlementFiltersHeader],
  );

  const refreshing =
    activeTab === 'transactions'
      ? !!isRefetchingTx && page === 1
      : !!isRefetchingSettlement && settlementPage === 1;

  const txFooterLoader =
    activeTab === 'transactions' && loadingMoreTx ? (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    ) : null;

  const settlementFooterLoader =
    activeTab === 'settlements' && loadingMoreSettlement ? (
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
        containerStyle={styles.appHeaderPad}
      />

      <View style={styles.body}>
        {activeTab === 'transactions' ? (
          transactionsError && transactionsList.length === 0 ? (
            <View style={styles.flexFill}>
              {transactionsHeader}
              <View style={styles.centerLoader}>
                <CustomText style={styles.emptyText}>
                  {t('wallet.loadError')}
                </CustomText>
              </View>
            </View>
          ) : (
            <FlatList
              data={transactionsList}
              keyExtractor={item =>
                item._id || item.transactionId || String(Math.random())
              }
              renderItem={renderTransaction}
              ListHeaderComponent={transactionsHeader}
              ListFooterComponent={
                <>
                  {txFooterLoader}
                  <View style={styles.listBottomSpacer} />
                </>
              }
              contentContainerStyle={styles.listContent}
              style={styles.flexFill}
              showsVerticalScrollIndicator={false}
              onEndReached={loadMoreTx}
              onEndReachedThreshold={0.35}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[theme.colors.primary || '#135D96']}
                  tintColor={theme.colors.primary}
                />
              }
              ListEmptyComponent={
                loadingTransactions && page === 1 ? (
                  <View style={styles.emptyTxWrap}>
                    <ActivityIndicator
                      size="large"
                      color={theme.colors.primary}
                    />
                  </View>
                ) : (
                  <View style={styles.emptyTxWrap}>
                    <CustomText style={styles.emptyText}>
                      {t('wallet.noTransactions')}
                    </CustomText>
                  </View>
                )
              }
            />
          )
        ) : (
          <FlatList
            data={settlementList}
            keyExtractor={item => item._id}
            renderItem={renderSettlementItem}
            ListHeaderComponent={settlementsHeader}
            ListFooterComponent={
              <>
                {settlementFooterLoader}
                <View style={styles.listBottomSpacer} />
              </>
            }
            contentContainerStyle={styles.listContent}
            style={styles.flexFill}
            showsVerticalScrollIndicator={false}
            onEndReached={loadMoreSettlement}
            onEndReachedThreshold={0.35}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[theme.colors.primary || '#135D96']}
                tintColor={theme.colors.primary}
              />
            }
            ListEmptyComponent={
              loadingSettlement && settlementPage === 1 ? (
                <View style={styles.emptyTxWrap}>
                  <ActivityIndicator
                    size="large"
                    color={theme.colors.primary}
                  />
                </View>
              ) : (
                <View style={styles.infoBanner}>
                  <VectoreIcons
                    name="information-circle-outline"
                    icon="Ionicons"
                    size={theme.SF(22)}
                    color={theme.colors.primary || '#135D96'}
                  />
                  <CustomText style={styles.infoBannerText}>
                    {t('wallet.noSettlementRequests')}
                  </CustomText>
                </View>
              )
            }
          />
        )}
      </View>

      <WithdrawRequestForm
        visible={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        balance={withdrawable}
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
      backgroundColor: theme.colors.background || '#F5F6F8',
    },
    body: {
      flex: 1,
    },
    flexFill: {
      flex: 1,
    },
    listContent: {
      paddingHorizontal: theme.SW?.(16) ?? 16,
      paddingBottom: SH(100),
      flexGrow: 1,
    },
    heroCard: {
      marginTop: theme.SH?.(12) ?? 12,
      borderRadius: theme.borderRadius?.lg ?? 16,
      backgroundColor: theme.colors.primary || '#009BFF',
      padding: theme.SW?.(18) ?? 18,
      shadowColor: '#135D96',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 8,
    },
    heroTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.SW?.(12) ?? 12,
    },
    heroLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.SW?.(12) ?? 12,
      minWidth: 0,
    },
    heroIconWrap: {
      width: theme.SF?.(48) ?? 48,
      height: theme.SF?.(48) ?? 48,
      borderRadius: theme.SF?.(24) ?? 24,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroTextCol: {
      flex: 1,
      minWidth: 0,
    },
    heroLabel: {
      fontSize: theme.fontSize?.xs ?? 12,
      fontFamily: theme.fonts?.MEDIUM,
      color: 'rgba(255,255,255,0.92)',
      marginBottom: theme.SH?.(4) ?? 4,
    },
    heroAmount: {
      fontSize: theme.fontSize?.xxl ?? 26,
      fontFamily: theme.fonts?.BOLD,
      color: '#fff',
    },
    heroCurrency: {
      fontSize: theme.fontSize?.xs ?? 12,
      fontFamily: theme.fonts?.REGULAR,
      color: 'rgba(255,255,255,0.85)',
      marginTop: 2,
    },
    heroCta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: 'rgba(255,255,255,0.95)',
      paddingVertical: theme.SH?.(10) ?? 10,
      paddingHorizontal: theme.SW?.(12) ?? 12,
      borderRadius: theme.borderRadius?.md ?? 12,
      maxWidth: '42%',
    },
    heroCtaText: {
      flex: 1,
      fontSize: theme.fontSize?.xs ?? 12,
      fontFamily: theme.fonts?.SEMI_BOLD,
      color: theme.colors.primary || '#135D96',
    },
    summaryBox: {
      marginTop: theme.SH?.(16) ?? 16,
      backgroundColor: theme.colors.secondary ?? '#fff',
      borderRadius: theme.borderRadius?.md ?? 14,
      paddingVertical: theme.SH?.(4) ?? 4,
      paddingHorizontal: theme.SW?.(14) ?? 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border || 'rgba(0,0,0,0.08)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 3,
    },
    summaryDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.border || 'rgba(0,0,0,0.08)',
      marginVertical: theme.SH?.(10) ?? 10,
    },
    kvRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.SW?.(12) ?? 12,
      paddingVertical: theme.SH?.(2) ?? 2,
    },
    kvLabel: {
      flex: 1,
      fontSize: theme.fontSize?.sm ?? 13,
      fontFamily: theme.fonts?.REGULAR,
      color: theme.colors.lightText ?? '#64748b',
    },
    kvValue: {
      maxWidth: '52%',
      fontSize: theme.fontSize?.sm ?? 14,
      fontFamily: theme.fonts?.SEMI_BOLD,
      color: theme.colors.text ?? '#111',
      textAlign: 'right',
    },
    tabBar: {
      flexDirection: 'row',
      marginTop: theme.SH?.(16) ?? 16,
      marginBottom: theme.SH?.(8) ?? 8,
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
    },
    tabTextActive: {
      color: '#fff',
    },
    txCard: {
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
    txCardInner: {
      padding: theme.SW?.(16) ?? 16,
    },
    txCardMain: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: theme.SW?.(12) ?? 12,
      marginBottom: theme.SH?.(10) ?? 10,
    },
    txDescBold: {
      flex: 1,
      fontSize: theme.fontSize?.md ?? 15,
      fontFamily: theme.fonts?.SEMI_BOLD,
      color: theme.colors.text,
      lineHeight: theme.SF?.(21) ?? 21,
    },
    txAmountHero: {
      fontSize: theme.fontSize?.lg ?? 17,
      fontFamily: theme.fonts?.BOLD,
    },
    txAmountCredit: {
      color: theme.colors.success || '#15803d',
    },
    txAmountDebit: {
      color: theme.colors.text,
    },
    txDateMuted: {
      fontSize: theme.fontSize?.xs ?? 12,
      fontFamily: theme.fonts?.REGULAR,
      color: theme.colors.lightText ?? '#94a3b8',
      marginBottom: theme.SH?.(10) ?? 10,
    },
    statusPill: {
      alignSelf: 'flex-start',
      paddingHorizontal: theme.SW?.(12) ?? 12,
      paddingVertical: theme.SH?.(6) ?? 6,
      borderRadius: theme.borderRadius?.xl ?? 20,
    },
    statusPillText: {
      fontSize: theme.fontSize?.xs ?? 12,
      fontFamily: theme.fonts?.SEMI_BOLD,
      textTransform: 'capitalize',
    },
    filterWrap: {
      marginTop: theme.SH?.(4) ?? 4,
      marginBottom: theme.SH?.(12) ?? 12,
    },
    filterList: {
      gap: theme.SW?.(8) ?? 8,
      paddingBottom: theme.SH?.(4) ?? 4,
    },
    filterChip: {
      paddingHorizontal: theme.SW?.(14) ?? 14,
      paddingVertical: theme.SH?.(8) ?? 8,
      borderRadius: theme.borderRadius?.xl ?? 20,
      backgroundColor: theme.colors.background || '#f1f5f9',
      marginRight: theme.SW?.(8) ?? 8,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border || '#e5e7eb',
    },
    filterChipActive: {
      backgroundColor: theme.colors.primary ?? '#135D96',
      borderColor: theme.colors.primary ?? '#135D96',
    },
    filterChipText: {
      fontSize: theme.fontSize?.xs ?? 12,
      color: theme.colors.text,
      fontFamily: theme.fonts?.MEDIUM,
    },
    filterChipTextActive: {
      color: '#fff',
    },
    infoBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.SW?.(10) ?? 10,
      padding: theme.SW?.(16) ?? 16,
      borderRadius: theme.borderRadius?.md ?? 12,
      backgroundColor: 'rgba(19, 93, 150, 0.08)',
      marginHorizontal: theme.SW?.(4) ?? 4,
      marginTop: theme.SH?.(8) ?? 8,
    },
    infoBannerText: {
      flex: 1,
      fontSize: theme.fontSize?.sm ?? 13,
      fontFamily: theme.fonts?.REGULAR,
      color: theme.colors.text,
      lineHeight: theme.SF?.(18) ?? 18,
    },
    settlementCard: {
      marginBottom: theme.SH?.(14) ?? 14,
      borderRadius: theme.borderRadius?.lg ?? 16,
      backgroundColor: theme.colors.secondary ?? '#fff',
      overflow: 'hidden',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border || 'rgba(0,0,0,0.07)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    settlementHero: {
      paddingHorizontal: theme.SW?.(16) ?? 16,
      paddingTop: theme.SH?.(16) ?? 16,
      paddingBottom: theme.SH?.(14) ?? 14,
      backgroundColor: 'rgba(19, 93, 150, 0.06)',
      borderLeftWidth: 4,
    },
    settlementHeroTop: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: theme.SW?.(12) ?? 12,
      marginBottom: theme.SH?.(12) ?? 12,
    },
    settlementAmountBlock: {
      flex: 1,
      minWidth: 0,
    },
    settlementAmountCaption: {
      fontSize: theme.fontSize?.xs ?? 11,
      fontFamily: theme.fonts?.MEDIUM,
      color: theme.colors.lightText ?? '#64748b',
      letterSpacing: 0.3,
      textTransform: 'uppercase',
      marginBottom: theme.SH?.(4) ?? 4,
    },
    settlementAmountHero: {
      fontSize: theme.fontSize?.xl ?? 22,
      fontFamily: theme.fonts?.BOLD,
      color: theme.colors.text ?? '#0f172a',
    },
    settlementHeroPill: {
      paddingHorizontal: theme.SW?.(12) ?? 12,
      paddingVertical: theme.SH?.(8) ?? 8,
      borderRadius: theme.borderRadius?.xl ?? 20,
      maxWidth: '42%',
    },
    settlementHeroPillText: {
      fontSize: theme.fontSize?.xs ?? 12,
      fontFamily: theme.fonts?.SEMI_BOLD,
      textTransform: 'capitalize',
      textAlign: 'center',
    },
    settlementMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.SW?.(6) ?? 6,
      marginBottom: theme.SH?.(8) ?? 8,
    },
    settlementMetaText: {
      fontSize: theme.fontSize?.sm ?? 13,
      fontFamily: theme.fonts?.REGULAR,
      color: theme.colors.lightText ?? '#64748b',
      flex: 1,
    },
    settlementIdCard: {
      marginTop: theme.SH?.(4) ?? 4,
      padding: theme.SW?.(12) ?? 12,
      borderRadius: theme.borderRadius?.md ?? 10,
      backgroundColor: theme.colors.secondary ?? '#fff',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border || 'rgba(0,0,0,0.06)',
    },
    settlementIdLabel: {
      fontSize: theme.fontSize?.xs ?? 11,
      fontFamily: theme.fonts?.MEDIUM,
      color: theme.colors.lightText ?? '#64748b',
      marginBottom: theme.SH?.(4) ?? 4,
    },
    settlementIdValue: {
      fontSize: theme.fontSize?.xs ?? 12,
      fontFamily: theme.fonts?.MEDIUM,
      color: theme.colors.text ?? '#334155',
    },
    settlementBankSection: {
      paddingHorizontal: theme.SW?.(16) ?? 16,
      paddingTop: theme.SH?.(14) ?? 14,
      paddingBottom: theme.SH?.(10) ?? 10,
      backgroundColor: theme.colors.background || '#fafafa',
    },
    settlementSectionTitle: {
      fontSize: theme.fontSize?.sm ?? 13,
      fontFamily: theme.fonts?.BOLD,
      color: theme.colors.text ?? '#0f172a',
      marginBottom: theme.SH?.(12) ?? 12,
      letterSpacing: 0.2,
    },
    settlementField: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.SW?.(12) ?? 12,
      paddingVertical: theme.SH?.(10) ?? 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border || 'rgba(0,0,0,0.06)',
    },
    settlementFieldLast: {
      borderBottomWidth: 0,
      paddingBottom: theme.SH?.(4) ?? 4,
    },
    settlementFieldIcon: {
      width: theme.SF?.(40) ?? 40,
      height: theme.SF?.(40) ?? 40,
      borderRadius: theme.SF?.(12) ?? 12,
      backgroundColor: 'rgba(19, 93, 150, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    settlementFieldBody: {
      flex: 1,
      minWidth: 0,
    },
    settlementFieldLabel: {
      fontSize: theme.fontSize?.xs ?? 11,
      fontFamily: theme.fonts?.MEDIUM,
      color: theme.colors.lightText ?? '#64748b',
      marginBottom: theme.SH?.(3) ?? 3,
    },
    settlementFieldValue: {
      fontSize: theme.fontSize?.sm ?? 14,
      fontFamily: theme.fonts?.SEMI_BOLD,
      color: theme.colors.text ?? '#1e293b',
      lineHeight: theme.SF?.(20) ?? 20,
    },
    loadMoreBtn: {
      paddingVertical: theme.SH?.(14) ?? 14,
      alignItems: 'center',
    },
    loadMoreText: {
      fontSize: theme.fontSize?.sm ?? 14,
      color: theme.colors.primary,
      fontFamily: theme.fonts?.SEMI_BOLD,
    },
    centerLoader: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 200,
    },
    emptyText: {
      fontSize: theme.fontSize?.md ?? 15,
      color: theme.colors.lightText ?? '#888',
      fontFamily: theme.fonts?.REGULAR,
      textAlign: 'center',
    },
    emptyTxWrap: {
      paddingVertical: theme.SH?.(40) ?? 40,
    },
    heroLoader: {
      marginTop: theme.SH?.(8) ?? 8,
    },
    appHeaderPad: {
      paddingHorizontal: theme.SW?.(20) ?? 20,
    },
    listBottomSpacer: {
      height: SH(24),
    },
    footerLoader: {
      paddingVertical: theme.SH?.(12) ?? 12,
      alignItems: 'center',
    },
  });
