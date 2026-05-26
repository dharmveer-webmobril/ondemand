import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { AppHeader, Container, CustomText } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';
import {
  extractCustomerEmailEnabled,
  extractCustomerNotificationEnabled,
  useGetCustomerNotificationSettings,
  useUpdateCustomerNotificationSettings,
} from '@services/api/queries/notificationQueries';
import { handleApiError } from '@utils/apiHelpers';

export default function NotificationsAlerts() {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  const navigation = useNavigation();

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(false);

  const { data: settings, isFetching } = useGetCustomerNotificationSettings();
  const updateSettings = useUpdateCustomerNotificationSettings();

  useEffect(() => {
    setNotificationsEnabled(extractCustomerNotificationEnabled(settings));
    setEmailEnabled(extractCustomerEmailEnabled(settings));
  }, [settings]);

  const handleNotificationToggle = async (enabled: boolean) => {
    const previousValue = notificationsEnabled;
    setNotificationsEnabled(enabled);

    try {
      await updateSettings.mutateAsync({ enabled });
    } catch (error) {
      setNotificationsEnabled(previousValue);
      handleApiError(error);
    }
  };

  return (
    <Container safeArea style={styles.container}>
      <AppHeader
        title={t('profile.notificationsAlerts')}
        onLeftPress={() => navigation.goBack()}
        backgroundColor={theme.colors.background}
        tintColor={theme.colors.text}
        containerStyle={styles.headerContainer}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.section}>
          <CustomText style={styles.sectionTitle}>
            {t('notifications.supportSection')}
          </CustomText>

          <View style={styles.toggleItem}>
            <CustomText style={styles.toggleLabel}>
              {t('notifications.title')}
            </CustomText>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationToggle}
              disabled={isFetching || updateSettings.isPending}
              trackColor={{
                false: theme.colors.secondary || '#D1D5DB',
                true: theme.colors.primary,
              }}
              thumbColor={theme.colors.white}
            />
          </View>

          <View style={styles.toggleItem}>
            <CustomText style={styles.toggleLabel}>
              {t('notifications.emailNotifications')}
            </CustomText>
            <Switch
              value={emailEnabled}
              onValueChange={setEmailEnabled}
              disabled={isFetching}
              trackColor={{
                false: theme.colors.secondary || '#D1D5DB',
                true: theme.colors.primary,
              }}
              thumbColor={theme.colors.white}
            />
          </View>
        </View>
      </ScrollView>
    </Container>
  );
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background || '#F7F7F7',
    },
    headerContainer: {
      paddingHorizontal: theme.SW(20),
    },
    scrollContent: {
      paddingHorizontal: theme.SW(20),
      paddingTop: theme.SH(20),
      paddingBottom: theme.SH(20),
    },
    section: {
      marginBottom: theme.SH(30),
    },
    sectionTitle: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.lightText,
      fontFamily: theme.fonts.MEDIUM,
      marginBottom: theme.SH(12),
      paddingHorizontal: theme.SW(4),
    },
    toggleItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.colors.white,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.SW(20),
      paddingVertical: theme.SH(14),
      marginBottom: theme.SH(12),
      borderWidth: 1,
      borderColor: theme.colors.secondary || '#EAEAEA',
    },
    toggleLabel: {
      flex: 1,
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      fontFamily: theme.fonts.MEDIUM,
      paddingRight: theme.SW(12),
    },
  });
