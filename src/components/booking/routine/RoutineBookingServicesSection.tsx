import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BoundedVerticalScroll, CustomText } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';
import RoutineDetailSection from './RoutineDetailSection';
import { formatAmount } from '@utils/formatAmount';
import type { RoutineServiceDetailDisplay } from '@utils/routineBookingHelpers';

export type { RoutineServiceDetailDisplay as RoutineServiceDetailItem };

type RoutineBookingServicesSectionProps = {
  services: RoutineServiceDetailDisplay[];
};

function AmountRow({
  label,
  amount,
  styles,
  valueStyle,
}: {
  label: string;
  amount: number;
  styles: ReturnType<typeof createStyles>;
  valueStyle?: object;
}) {
  return (
    <View style={styles.amountRow}>
      <CustomText style={styles.amountLabel}>{label}</CustomText>
      <CustomText style={[styles.amountValue, valueStyle]}>
        {formatAmount(amount)}
      </CustomText>
    </View>
  );
}

export default function RoutineBookingServicesSection({
  services,
}: RoutineBookingServicesSectionProps) {
  const { t } = useTranslation();
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (services.length === 0) return null;

  return (
    <RoutineDetailSection title={t('routineBooking.servicesSection')}>
      <BoundedVerticalScroll
        itemCount={services.length}
        maxHeight={theme.SH(360)}
        style={styles.card}
        contentContainerStyle={styles.scrollContent}
      >
        {services.map((svc, index) => (
          <View
            key={svc.serviceId}
            style={[
              styles.serviceRow,
              index < services.length - 1 && styles.serviceRowBorder,
            ]}
          >
            <View style={styles.serviceHeader}>
              <CustomText style={styles.serviceName} numberOfLines={2}>
                {svc.name}
              </CustomText>
              {svc.durationMinutes ? (
                <CustomText style={styles.durationText}>
                  {svc.durationMinutes} min
                </CustomText>
              ) : null}
            </View>

            <AmountRow
              label={t('routineBooking.serviceBasePrice')}
              amount={svc.price}
              styles={styles}
            />

            {svc.addOns.length > 0 ? (
              <View style={styles.addOnsBlock}>
                <CustomText style={styles.addOnsHeading}>
                  {t('routineBooking.selectedAddOns')}
                </CustomText>
                {svc.addOns.map((addOn, addOnIndex) => (
                  <View
                    key={`${svc.serviceId}-addon-${addOnIndex}`}
                    style={styles.addOnRow}
                  >
                    <CustomText style={styles.addOnText} numberOfLines={2}>
                      {addOn.name}
                      {addOn.quantity > 1 ? ` × ${addOn.quantity}` : ''}
                    </CustomText>
                    <CustomText style={styles.addOnAmount}>
                      {formatAmount(addOn.lineTotal)}
                    </CustomText>
                  </View>
                ))}
                <AmountRow
                  label={t('routineBooking.addOnsLabel')}
                  amount={svc.addOnsTotal}
                  styles={styles}
                  valueStyle={styles.addOnsTotalValue}
                />
              </View>
            ) : null}
          </View>
        ))}
      </BoundedVerticalScroll>
    </RoutineDetailSection>
  );
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.SF(12),
      borderWidth: 1,
      borderColor: theme.colors.gray || '#E8E8E8',
      overflow: 'hidden',
    },
    scrollContent: {
      flexGrow: 1,
    },
    serviceRow: {
      paddingHorizontal: theme.SW(16),
      paddingVertical: theme.SH(14),
      gap: theme.SH(10),
    },
    serviceRowBorder: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.gray || '#EEE',
    },
    serviceHeader: {
      gap: theme.SH(4),
    },
    serviceName: {
      fontSize: theme.fontSize.md,
      fontFamily: theme.fonts.SEMI_BOLD,
      color: theme.colors.text,
    },
    durationText: {
      fontSize: theme.fontSize.sm,
      fontFamily: theme.fonts.REGULAR,
      color: theme.colors.lightText,
    },
    amountRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.SW(12),
    },
    amountLabel: {
      fontSize: theme.fontSize.sm,
      fontFamily: theme.fonts.REGULAR,
      color: theme.colors.lightText,
      flex: 1,
    },
    amountValue: {
      fontSize: theme.fontSize.sm,
      fontFamily: theme.fonts.MEDIUM,
      color: theme.colors.text,
      textAlign: 'right',
    },
    addOnsBlock: {
      gap: theme.SH(8),
      paddingTop: theme.SH(2),
    },
    addOnsHeading: {
      fontSize: theme.fontSize.xs,
      fontFamily: theme.fonts.MEDIUM,
      color: theme.colors.lightText,
      textTransform: 'uppercase',
      letterSpacing: 0.3,
    },
    addOnRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: theme.SW(12),
      paddingLeft: theme.SW(4),
    },
    addOnText: {
      flex: 1,
      fontSize: theme.fontSize.sm,
      fontFamily: theme.fonts.REGULAR,
      color: theme.colors.text,
      lineHeight: theme.SH(18),
    },
    addOnAmount: {
      fontSize: theme.fontSize.sm,
      fontFamily: theme.fonts.MEDIUM,
      color: theme.colors.text,
      textAlign: 'right',
    },
    addOnsTotalValue: {
      fontFamily: theme.fonts.SEMI_BOLD,
      color: theme.colors.primary,
    },
  });
