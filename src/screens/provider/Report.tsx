import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Container, AppHeader, CustomInput, CustomButton, CustomText } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CountryModal } from '@components';
import { showToast } from '@components/common';

export default function Report() {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const navigation = useNavigation();
  const [selectedReason, setSelectedReason] = useState<any>(null);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reportText, setReportText] = useState('');

  const reportReasons = useMemo(() => [
    { id: '1', name: t('report.inappropriateContent') },
    { id: '2', name: t('report.spamOrScam') },
    { id: '3', name: t('report.harassment') },
    { id: '4', name: t('report.fakeProfile') },
    { id: '5', name: t('report.other') },
  ], [t]);

  const handleSubmit = () => {
    if (!selectedReason) {
      showToast({
        type: 'error',
        title: t('messages.error'),
        message: t('report.selectReasonError'),
      });
      return;
    }

    if (!reportText.trim()) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Please provide more details',
      });
      return;
    }

    // Handle report submission
    showToast({
      type: 'success',
      title: t('messages.success'),
      message: t('report.submitSuccess'),
    });
    navigation.goBack();
  };

  return (
    <Container safeArea={false} style={styles.container}>
      <AppHeader
        title={t('report.title')}
        onLeftPress={() => navigation.goBack()}
        backgroundColor="transparent"
        tintColor={theme.colors.text}
        containerStyle={{ paddingTop: insets.top }}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <CustomText style={styles.label}>{t('report.selectReason')}</CustomText>
          <Pressable onPress={() => setShowReasonModal(true)}>
            <CustomInput
              placeholder={t('report.selectReasonPlaceholder')}
              value={selectedReason?.name || ''}
              editable={false}
              rightIcon="chevron-down"
              containerStyle={styles.input}
            />
          </Pressable>
        </View>

        <View style={styles.section}>
          <CustomText style={styles.label}>{t('report.tellUsMore')}</CustomText>
          <CustomInput
            placeholder={t('report.describeIssue')}
            value={reportText}
            onChangeText={setReportText}
            multiline
            numberOfLines={6}
            containerStyle={styles.textArea}
            inputStyle={styles.textAreaInput}
          />
        </View>

        <CustomButton
          title={t('report.submit')}
          onPress={handleSubmit}
          buttonStyle={styles.submitButton}
          backgroundColor={theme.colors.primary}
          textColor={theme.colors.whitetext}
        />
      </ScrollView>

      <CountryModal
        type="city"
        data={reportReasons}
        visible={showReasonModal}
        onClose={() => setShowReasonModal(false)}
        onSelect={(reason) => {
          setSelectedReason(reason);
          setShowReasonModal(false);
        }}
        selectedId={selectedReason?.id}
        isLoading={false}
      />
    </Container>
  );
}

const createStyles = (theme: ThemeType) => {
  const { colors: Colors, SF, fonts: Fonts, SW, SH } = theme;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.white,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      paddingHorizontal: SW(20),
      paddingVertical: SH(20),
    },
    section: {
      marginBottom: SH(20),
    },
    label: {
      fontSize: SF(14),
      fontFamily: Fonts.MEDIUM,
      color: Colors.text,
      marginBottom: SH(8),
    },
    input: {
      marginBottom: 0,
    },
    textArea: {
      minHeight: SH(120),
      marginBottom: 0,
    },
    textAreaInput: {
      minHeight: SH(120),
      textAlignVertical: 'top',
    },
    submitButton: {
      borderRadius: SF(12),
      marginTop: SH(20),
    },
  });
};

