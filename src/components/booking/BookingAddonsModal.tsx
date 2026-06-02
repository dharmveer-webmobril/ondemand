import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemeContext } from '@utils/theme';
import { CustomText, CustomButton, Checkbox } from '@components/common';
import PaymentMethodModal from '@components/checkout/PaymentMethodModal';
import {
  useGetServiceAddOns,
  type ServiceAddonItem,
} from '@services/api/queries/appQueries';
import { SH } from '@utils/dimensions';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatAmount } from '@utils/formatAmount';

export function getCatalogServiceId(service: any): string | null {
  if (!service) return null;
  const sid = service?.serviceId;
  if (typeof sid === 'string' && sid.length > 0) return sid;
  if (sid && typeof sid === 'object' && sid._id) return String(sid._id);
  return null;
}

export function getAddonPayableAmount(addon: ServiceAddonItem): number {
  const price = Number(addon?.price) || 0;
  const pct = Math.min(
    100,
    Math.max(0, Number(addon?.discountPercentage) || 0),
  );
  const raw = price * (1 - pct / 100);
  return Math.round(raw * 100) / 100;
}

type BookingAddonsModalProps = {
  visible: boolean;
  onClose: () => void;
  bookedService: any | null;
  onProceedToPayment: (
    selectedAddons: Array<ServiceAddonItem & { quantity: number }>,
    gateway: 'stripe' | 'paypal' | 'flutterwave',
  ) => void;
  isProcessing?: boolean;
  /** When true, overlay shows gateway-specific connecting text instead of generic processing */
  paymentGatewayHint?: 'stripe' | 'paypal' | 'flutterwave' | null;
};

export default function BookingAddonsModal({
  visible,
  onClose,
  bookedService,
  onProceedToPayment,
  isProcessing = false,
  paymentGatewayHint = null,
}: BookingAddonsModalProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();

  const catalogServiceId = bookedService
    ? getCatalogServiceId(bookedService)
    : null;

  const { data, isLoading, isError, refetch, isFetching } = useGetServiceAddOns(
    catalogServiceId ?? undefined,
    visible && !!catalogServiceId,
  );

  const addons: ServiceAddonItem[] = useMemo(() => {
    const rd = data?.ResponseData;
    return Array.isArray(rd) ? rd : [];
  }, [data]);

  const [selectedQtyById, setSelectedQtyById] = useState<Record<string, number>>(
    {},
  );
  const [showPayModal, setShowPayModal] = useState(false);

  useEffect(() => {
    if (!visible) {
      setSelectedQtyById({});
      setShowPayModal(false);
    }
  }, [visible]);

  const toggleId = (id: string) => {
    setSelectedQtyById(prev => {
      const current = prev[id];
      if (current != null) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: 1 };
    });
  };

  const setQty = (id: string, qty: number) => {
    const safeQty = Number.isFinite(qty) ? Math.max(1, Math.floor(qty)) : 1;
    setSelectedQtyById(prev => {
      if (prev[id] == null) return prev;
      return { ...prev, [id]: safeQty };
    });
  };

  const selectedAddons = useMemo(
    () =>
      addons
        .filter(a => selectedQtyById[a._id] != null)
        .map(a => ({ ...a, quantity: selectedQtyById[a._id] ?? 1 })),
    [addons, selectedQtyById],
  );

  const totalAmount = useMemo(
    () =>
      selectedAddons.reduce(
        (sum, a) => sum + getAddonPayableAmount(a) * (a.quantity || 1),
        0,
      ),
    [selectedAddons],
  );

  const handlePressPay = () => {
    if (selectedAddons.length === 0) return;
    setShowPayModal(true);
  };

  const handlePaymentMethodConfirm = (
    method: 'paypal' | 'stripe' | 'flutterwave' | 'cash',
  ) => {
    if (method === 'cash') {
      return;
    }
    setShowPayModal(false);
    onProceedToPayment(selectedAddons, method);
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!isProcessing) onClose();
        }}
        statusBarTranslucent
      >
        <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
          <View style={styles.modalRoot}>
            <Pressable
              style={styles.overlay}
              onPress={isProcessing ? undefined : onClose}
            >
              <Pressable
                style={styles.sheet}
                onPress={e => e.stopPropagation()}
              >
                <View style={styles.header}>
                  <CustomText style={styles.title}>
                    {t('bookingDetail.addOns.title')}
                  </CustomText>
                  <Pressable
                    onPress={isProcessing ? undefined : onClose}
                    hitSlop={12}
                  >
                    <CustomText style={styles.close}>{'\u2715'}</CustomText>
                  </Pressable>
                </View>

                {!catalogServiceId ? (
                  <View style={styles.emptyState}>
                    <CustomText style={styles.emptyStateText}>
                      {t('bookingDetail.addOns.noService')}
                    </CustomText>
                  </View>
                ) : isLoading ? (
                  <View style={styles.emptyState}>
                    <ActivityIndicator color={theme.colors.primary} />
                  </View>
                ) : isError || addons.length === 0 ? (
                  <View style={styles.emptyState}>
                    <CustomText
                      style={[
                        styles.emptyStateText,
                        ...(isError ? [styles.emptyStateTextError] : []),
                      ]}
                    >
                      {isError
                        ? t('bookingDetail.addOns.loadError')
                        : t('bookingDetail.addOns.empty')}
                    </CustomText>
                    <CustomButton
                      title={t('common.retry')}
                      onPress={() => refetch()}
                      isLoading={isFetching}
                      disable={isProcessing}
                      backgroundColor={theme.colors.primary}
                      textColor={theme.colors.white}
                      paddingHorizontal={theme.SW(32)}
                      marginTop={theme.SH(16)}
                      buttonStyle={styles.reloadButton}
                    />
                  </View>
                ) : (
                  <FlatList
                    data={addons}
                    keyExtractor={item => item._id}
                    style={styles.list}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => {
                      const checked = selectedQtyById[item._id] != null;
                      const qty = checked ? selectedQtyById[item._id] ?? 1 : 1;
                      const lineTotal = getAddonPayableAmount(item) * qty;
                      return (
                        <Pressable
                          style={[styles.row, checked && styles.rowSelected]}
                          onPress={() => toggleId(item._id)}
                        >
                          <View style={{ flex: 1 }}>
                            <CustomText style={styles.addonName}>
                              {item.name}
                            </CustomText>
                            {item.description ? (
                              <CustomText style={styles.desc} numberOfLines={2}>
                                {item.description}
                              </CustomText>
                            ) : null}
                            <CustomText style={styles.priceLine}>
                              {formatAmount(lineTotal)}{' '}
                              {item.discountPercentage != null &&
                              item.discountPercentage > 0
                                ? t('bookingDetail.addOns.afterDiscount', {
                                    pct: String(item.discountPercentage),
                                  })
                                : null}
                            </CustomText>
                          </View>
                          <View style={styles.controls}>
                            {checked ? (
                              <View style={styles.qtyControls}>
                                <Pressable
                                  style={styles.qtyBtn}
                                  onPress={() => setQty(item._id, qty - 1)}
                                  hitSlop={10}
                                >
                                  <CustomText style={styles.qtyBtnText}>
                                    -
                                  </CustomText>
                                </Pressable>
                                <CustomText style={styles.qtyText}>
                                  {String(qty)}
                                </CustomText>
                                <Pressable
                                  style={styles.qtyBtn}
                                  onPress={() => setQty(item._id, qty + 1)}
                                  hitSlop={10}
                                >
                                  <CustomText style={styles.qtyBtnText}>
                                    +
                                  </CustomText>
                                </Pressable>
                              </View>
                            ) : null}
                            <Checkbox
                              checked={checked}
                              onChange={() => toggleId(item._id)}
                              size={theme.SF(20)}
                            />
                          </View>
                        </Pressable>
                      );
                    }}
                  />
                )}

                <View style={styles.footer}>
                  <View style={styles.totalRow}>
                    <CustomText style={styles.totalLabel}>
                      {t('bookingDetail.addOns.total')}
                    </CustomText>
                    <CustomText style={styles.totalValue}>
                      {formatAmount(totalAmount)}
                    </CustomText>
                  </View>
                  <CustomButton
                    title={t('bookingDetail.addOns.continueToPay')}
                    onPress={handlePressPay}
                    disable={
                      selectedAddons.length === 0 ||
                      isProcessing ||
                      !catalogServiceId
                    }
                    isLoading={isProcessing}
                    backgroundColor={theme.colors.primary}
                    textColor={theme.colors.white}
                    buttonStyle={styles.cta}
                  />
                </View>
              </Pressable>
            </Pressable>
            {isProcessing ? (
              <View style={styles.processingOverlay} pointerEvents="auto">
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <CustomText style={styles.processingLabel}>
                  {paymentGatewayHint === 'paypal'
                    ? t('bookingDetail.addOns.connectingPayPal')
                    : paymentGatewayHint === 'flutterwave'
                    ? t('bookingDetail.addOns.connectingFlutterwave')
                    : t('bookingDetail.addOns.processingPayment')}
                </CustomText>
              </View>
            ) : null}
          </View>
        </SafeAreaView>
      </Modal>

      <PaymentMethodModal
        visible={showPayModal}
        onClose={() => setShowPayModal(false)}
        onConfirm={handlePaymentMethodConfirm}
        selectedPaymentMethod="stripe"
        allowedMethods={['stripe', 'flutterwave', 'paypal']}
      />
    </>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    modalRoot: {
      flex: 1,
    },
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: theme.colors.white,
      borderTopLeftRadius: theme.SF(16),
      borderTopRightRadius: theme.SF(16),
      paddingHorizontal: theme.SW(20),
      paddingTop: theme.SH(16),
      paddingBottom: theme.SH(28),
      maxHeight: '85%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.SH(12),
    },
    title: {
      fontSize: theme.fontSize?.lg ?? 18,
      fontFamily: theme.fonts?.SEMI_BOLD,
      color: theme.colors.text,
    },
    close: {
      fontSize: theme.SF(18),
      color: theme.colors.lightText,
      padding: theme.SW(4),
    },
    list: { maxHeight: SH(320) },
    listContent: { paddingBottom: theme.SH(8) },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.SH(12),
      paddingHorizontal: theme.SW(8),
      borderRadius: theme.borderRadius?.md ?? 12,
      marginBottom: theme.SH(8),
      backgroundColor: 'rgba(19, 93, 150, 0.06)',
    },
    rowSelected: {
      backgroundColor: 'rgba(19, 93, 150, 0.06)',
    },
    addonName: {
      fontSize: theme.fontSize?.md ?? 15,
      fontFamily: theme.fonts?.SEMI_BOLD,
      color: theme.colors.text,
    },
    desc: {
      fontSize: theme.fontSize?.xs ?? 12,
      color: theme.colors.lightText,
      // marginTop: theme.SH(4),
    },
    priceLine: {
      fontSize: theme.fontSize?.sm ?? 13,
      fontFamily: theme.fonts?.MEDIUM,
      color: theme.colors.primary,
      // marginTop: theme.SH(6),
    },
    controls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.SW?.(10) ?? 10,
      marginLeft: theme.SW?.(10) ?? 10,
    },
    qtyControls: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border || '#e5e7eb',
      borderRadius: theme.borderRadius?.md ?? 12,
      overflow: 'hidden',
    },
    qtyBtn: {
      paddingHorizontal: theme.SW?.(10) ?? 10,
      paddingVertical: theme.SH?.(6) ?? 6,
      backgroundColor: 'rgba(0,0,0,0.03)',
    },
    qtyBtnText: {
      fontSize: theme.fontSize?.md ?? 15,
      fontFamily: theme.fonts?.BOLD,
      color: theme.colors.text,
    },
    qtyText: {
      paddingHorizontal: theme.SW?.(10) ?? 10,
      fontSize: theme.fontSize?.sm ?? 14,
      fontFamily: theme.fonts?.SEMI_BOLD,
      color: theme.colors.text,
      minWidth: theme.SW?.(24) ?? 24,
      textAlign: 'center',
    },
    emptyState: {
      minHeight: SH(280),
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: theme.SH(24),
      paddingHorizontal: theme.SW(8),
    },
    emptyStateText: {
      fontSize: theme.fontSize?.sm ?? 14,
      color: theme.colors.lightText,
      textAlign: 'center',
    },
    emptyStateTextError: {
      color: theme.colors.error || '#c00',
    },
    reloadButton: {
      borderRadius: theme.borderRadius?.md ?? 12,
      alignSelf: 'center',
    },
    footer: {
      marginTop: theme.SH(12),
      paddingTop: theme.SH(12),
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border || '#e5e7eb',
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.SH(12),
    },
    totalLabel: {
      fontSize: theme.fontSize?.md ?? 15,
      fontFamily: theme.fonts?.SEMI_BOLD,
      color: theme.colors.text,
    },
    totalValue: {
      fontSize: theme.fontSize?.md ?? 15,
      fontFamily: theme.fonts?.BOLD,
      color: theme.colors.primary,
    },
    cta: {
      borderRadius: theme.borderRadius?.md ?? 12,
    },
    processingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(255,255,255,0.92)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      paddingHorizontal: theme.SW?.(16) ?? 16,
    },
    processingLabel: {
      marginTop: theme.SH?.(8) ?? 8,
      fontSize: theme.fontSize?.sm ?? 14,
      fontFamily: theme.fonts?.MEDIUM,
      color: theme.colors.text,
      textAlign: 'center',
      paddingHorizontal: theme.SW?.(24) ?? 24,
    },
  });
