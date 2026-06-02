import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BoundedVerticalScroll, CustomText } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';
import RoutineDetailSection from './RoutineDetailSection';
import { formatAmount } from '@utils/formatAmount';

export type RoutineServiceDetailItem = {
  serviceId: string;
  name: string;
  price?: number;
  durationMinutes?: number;
};

type RoutineBookingServicesSectionProps = {
  services: RoutineServiceDetailItem[];
};

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
        maxHeight={theme.SH(220)}
        style={styles.listBox}
        contentContainerStyle={styles.listContent}
      >
        {services.map((svc, index) => (
          <View
            key={svc.serviceId}
            style={[
              styles.row,
              index < services.length - 1 && styles.rowBorder,
            ]}
          >
            <CustomText style={styles.name}>{svc.name}</CustomText>
            <CustomText style={styles.meta}>
              {formatAmount(Number(svc.price || 0))} · {svc.durationMinutes}m
            </CustomText>
          </View>
        ))}
      </BoundedVerticalScroll>
    </RoutineDetailSection>
  );
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    listBox: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.SF(12),
      borderWidth: 1,
      borderColor: theme.colors.gray || '#E8E8E8',
    },
    listContent: {
      paddingVertical: theme.SH(4),
    },
    row: {
      padding: theme.SW(14),
    },
    rowBorder: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.gray || '#EEE',
    },
    name: {
      fontSize: theme.fontSize.sm,
      fontFamily: theme.fonts.SEMI_BOLD,
      color: theme.colors.text,
    },
    meta: {
      marginTop: theme.SH(4),
      fontSize: theme.fontSize.xs,
      color: theme.colors.lightText,
    },
  });
