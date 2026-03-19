import { View, StyleSheet, ScrollView } from 'react-native'
import React, { useMemo, useState, useEffect } from 'react'
import { Container, AppHeader, CustomButton, CustomInput } from '@components';
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText } from '@components/common';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { SH } from '@utils/dimensions';
import { useAppSelector } from '@store/hooks';
import { useCustomerSupport } from '@services/api/queries/appQueries';
import { showToast } from '@components/common/CustomToast';
import regex from '@utils/regexList';

export default function CustomerSupport() {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  const navigation = useNavigation();
  const userDetails = useAppSelector((state) => state.auth.userDetails);
  const supportMutation = useCustomerSupport();

  const [name, setName] = useState('');
  const [emailId, setEmailId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Prefill form with user details from Redux
  useEffect(() => {
    if (userDetails) {
      setName(userDetails.name || '');
      setEmailId(userDetails.email || '');
    }
  }, [userDetails]);

  const handleSubmit = async () => {
    // Validation
    if (!name.trim() || !regex.NAME_REGEX.test(name)) {
      showToast({
        type: 'error',
        title: t('messages.error') || 'Error',
        message: t('validation.emptyName') || 'Name is required',
      });
      return;
    }

    if (!emailId.trim() || !regex.EMAIL_REGEX_WITH_EMPTY.test(emailId)) {
      showToast({
        type: 'error',
        title: t('messages.error') || 'Error',
        message: t('validation.emptyEmail') || 'Email is required',
      });
      return;
    }

    if (!title.trim() || !regex.NAME_REGEX.test(title)) {
      showToast({
        type: 'error',
        title: t('messages.error') || 'Error',
        message: t('customerSupport.errors.titleRequired') || 'Title is required',
      });
      return;
    }

    if (!description.trim()) {
      showToast({
        type: 'error',
        title: t('messages.error') || 'Error',
        message: t('customerSupport.errors.descriptionRequired') || 'Description is required',
      });
      return;
    }
    if (description.trim() && description.trim().length < 10) {
      showToast({
        type: 'error',
        title: t('messages.error') || 'Error',
        message: t('customerSupport.errors.validDescription') || 'Description is required',
      });
      return;
    }

    try {
      const response = await supportMutation.mutateAsync({
        name: name.trim(),
        emailId: emailId.trim(),
        title: title.trim(),
        description: description.trim(),
      });

      if (response.succeeded && (response.ResponseCode === 200 || response.ResponseCode === 201)) {
        showToast({
          type: 'success',
          title: t('messages.success') || 'Success',
          message: t('customerSupport.messages.success') || 'Support request submitted successfully',
        });
        // Clear form
        setTitle('');
        setDescription('');
        navigation.goBack();
      } else {
        showToast({
          type: 'error',
          title: t('messages.error') || 'Error',
          message: response.ResponseMessage || t('customerSupport.messages.error') || 'Failed to submit support request',
        });
      }
    } catch (error: any) {
      console.error('Submit support error:', error);
      showToast({
        type: 'error',
        title: t('messages.error') || 'Error',
        message: error?.response?.data?.ResponseMessage || t('customerSupport.messages.error') || 'Failed to submit support request',
      });
    }
  };

  return (
    <Container safeArea={true} style={styles.container}>
      <AppHeader
        title={t('customerSupport.header')}
        onLeftPress={() => navigation.goBack()}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.formSection}>
          <View style={styles.inputContainer}>
            <CustomText style={styles.label}>
              {t('customerSupport.name')}
            </CustomText>
            <CustomInput
              placeholder={t('customerSupport.namePlaceholder')}
              value={name}
              onChangeText={setName}
              transparentBackground={true}
              marginTop={0}
            />
          </View>

          <View style={styles.inputContainer}>
            <CustomText style={styles.label}>
              {t('customerSupport.email')}
            </CustomText>
            <CustomInput
              placeholder={t('customerSupport.emailPlaceholder')}
              value={emailId}
              onChangeText={setEmailId}
              transparentBackground={true}
              marginTop={0}
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <CustomText style={styles.label}>
              {t('customerSupport.placeholder.title') || 'Title'}
            </CustomText>
            <CustomInput
              placeholder={t('customerSupport.placeholder.title') || 'Enter title'}
              value={title}
              onChangeText={setTitle}
              transparentBackground={true}
              marginTop={0}
            />
          </View>

          <View style={styles.inputContainer}>
            <CustomText style={styles.label}>
              {t('customerSupport.message')}
            </CustomText>
            <CustomInput
              placeholder={t('customerSupport.messagePlaceholder')}
              value={description}
              onChangeText={setDescription}
              transparentBackground={true}
              marginTop={0}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              style={{ height: theme.SH(100) }}
            />
          </View>
        </View>
        <CustomButton
          title={t('customerSupport.button.submit')}
          onPress={handleSubmit}
          buttonStyle={styles.submitButton}
          buttonTextStyle={styles.submitButtonText}
          isLoading={supportMutation.isPending}
          disable={supportMutation.isPending}
        />
      </ScrollView>


    </Container>
  );
}

const createStyles = (theme: ThemeType) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background || '#F7F7F7',
    paddingHorizontal: theme.SW(20),
  },
  scrollContent: {
    paddingTop: theme.SH(20),
    paddingBottom: theme.SH(100),
  },
  formSection: {
    marginTop: theme.SH(10),
  },
  inputContainer: {
    marginBottom: theme.SH(20),
  },
  label: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontFamily: theme.fonts.SEMI_BOLD,
    marginBottom: theme.SH(8),
  },
  submitButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: theme.SW(20),
    paddingBottom: SH(10),
    paddingTop: theme.SH(15),
    backgroundColor: theme.colors.background || '#F7F7F7',
    borderTopWidth: 1,
    borderTopColor: theme.colors.secondary || '#EAEAEA',
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.SH(50),
  },
  submitButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontFamily: theme.fonts.BOLD,
  },
});

