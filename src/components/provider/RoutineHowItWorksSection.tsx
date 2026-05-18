import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CustomText } from '@components/common';
import { useThemeContext } from '@utils/theme';
import BookAppointmentAccordion from './BookAppointmentAccordion';

type Props = {
  expanded: boolean;
  onToggle: () => void;
};

export default function RoutineHowItWorksSection({ expanded, onToggle }: Props) {
  const { t } = useTranslation();
  const theme = useThemeContext();
  const styles = createStyles(theme);

  return (
    <BookAppointmentAccordion
      title={t('bookAppointment.routineHowItWorks')}
      expanded={expanded}
      onToggle={onToggle}
      variant="info"
    >
      <CustomText style={styles.step}>{t('bookAppointment.routineStep1')}</CustomText>
      <CustomText style={styles.step}>{t('bookAppointment.routineStep2')}</CustomText>
      <CustomText style={styles.step}>{t('bookAppointment.routineStep3')}</CustomText>
      <View style={styles.tagRow}>
        <View style={styles.tag}>
          <CustomText style={styles.tagText}>
            {t('bookAppointment.advanceNotice24h')}
          </CustomText>
        </View>
        <View style={styles.tag}>
          <CustomText style={styles.tagText}>
            {t('bookAppointment.noSameDay')}
          </CustomText>
        </View>
      </View>
    </BookAppointmentAccordion>
  );
}

const createStyles = (theme: ReturnType<typeof useThemeContext>) =>
  StyleSheet.create({
    step: {
      fontSize: theme.fontSize.sm,
      fontFamily: theme.fonts.REGULAR,
      color: theme.colors.text,
      marginBottom: theme.SH(4),
      lineHeight: theme.SF(20),
    },
    tagRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.SW(8),
      marginTop: theme.SH(10),
    },
    tag: {
      paddingHorizontal: theme.SW(10),
      paddingVertical: theme.SH(4),
      borderRadius: theme.SF(6),
      backgroundColor: theme.colors.white,
      borderWidth: 1,
      borderColor: '#B8DAF5',
    },
    tagText: {
      fontSize: theme.fontSize.xs,
      fontFamily: theme.fonts.MEDIUM,
      color: theme.colors.primary,
    },
  });
