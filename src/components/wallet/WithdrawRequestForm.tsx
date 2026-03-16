import React, { useMemo } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { CustomText, CustomInput, CustomButton } from '@components/common';
import { useThemeContext } from '@utils/theme';
import { withdrawRequestSchema, type WithdrawRequestFormValues } from '@utils/validationSchemas';
import regex from '@utils/regexList';

export interface WithdrawRequestFormProps {
  visible: boolean;
  onClose: () => void;
  balance: number;
  onSubmit: (values: WithdrawRequestFormValues) => Promise<void>;
  isSubmitting: boolean;
}

const initialValues: WithdrawRequestFormValues = {
  amount: '',
  accountHolderName: '',
  bankName: '',
  accountNumber: '',
  ifscCode: '',
};

export default function WithdrawRequestForm({
  visible,
  onClose,
  balance,
  onSubmit,
  isSubmitting,
}: WithdrawRequestFormProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();

  const validationSchema = useMemo(
    () => withdrawRequestSchema(t, regex, balance),
    [t, balance]
  );

  const formik = useFormik<WithdrawRequestFormValues>({
    initialValues,
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      await onSubmit(values);
      formik.resetForm();
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalContentWrap}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <CustomText style={styles.modalTitle}>{t('wallet.withdrawRequest')}</CustomText>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.modalCloseBtn}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <CustomText style={styles.modalCloseText}>×</CustomText>
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <CustomInput
                label={t('wallet.amount')}
                placeholder={t('wallet.amountPlaceholder')}
                value={formik.values.amount}
                onChangeText={formik.handleChange('amount')}
                onBlur={formik.handleBlur('amount')}
                keyboardType="decimal-pad"
                marginTop={10}
                errortext={
                  formik.touched.amount && formik.errors.amount ? formik.errors.amount : ''
                }
              />
              <CustomInput
                label={t('wallet.accountHolderName')}
                placeholder={t('wallet.accountHolderNamePlaceholder')}
                value={formik.values.accountHolderName}
                onChangeText={formik.handleChange('accountHolderName')}
                onBlur={formik.handleBlur('accountHolderName')}
                marginTop={10}
                errortext={
                  formik.touched.accountHolderName && formik.errors.accountHolderName
                    ? formik.errors.accountHolderName
                    : ''
                }
              />
              <CustomInput
                label={t('wallet.bankName')}
                placeholder={t('wallet.bankNamePlaceholder')}
                value={formik.values.bankName}
                onChangeText={formik.handleChange('bankName')}
                onBlur={formik.handleBlur('bankName')}
                marginTop={10}
                errortext={
                  formik.touched.bankName && formik.errors.bankName
                    ? formik.errors.bankName
                    : ''
                }
              />
              <CustomInput
                label={t('wallet.accountNumber')}
                placeholder={t('wallet.accountNumberPlaceholder')}
                value={formik.values.accountNumber}
                onChangeText={formik.handleChange('accountNumber')}
                onBlur={formik.handleBlur('accountNumber')}
                keyboardType="number-pad"
                marginTop={10}
                errortext={
                  formik.touched.accountNumber && formik.errors.accountNumber
                    ? formik.errors.accountNumber
                    : ''
                }
              />
              <CustomInput
                label={t('wallet.ifscCode')}
                placeholder={t('wallet.ifscCodePlaceholder')}
                value={formik.values.ifscCode}
                onChangeText={formik.handleChange('ifscCode')}
                onBlur={formik.handleBlur('ifscCode')}
                marginTop={10}
                errortext={
                  formik.touched.ifscCode && formik.errors.ifscCode
                    ? formik.errors.ifscCode
                    : ''
                }
              />
              <CustomButton
                title={t('wallet.makeRequest')}
                onPress={() => formik.handleSubmit()}
                isLoading={isSubmitting || formik.isSubmitting}
                disable={isSubmitting || formik.isSubmitting}
                buttonStyle={styles.submitBtn}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContentWrap: {
      maxHeight: '90%',
    },
    modalContent: {
      backgroundColor: theme.colors.background ?? '#fff',
      borderTopLeftRadius: theme.borderRadius?.xl ?? 16,
      borderTopRightRadius: theme.borderRadius?.xl ?? 16,
      paddingBottom: theme.SH?.(24) ?? 24,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.SW?.(20) ?? 20,
      paddingTop: theme.SH?.(20) ?? 20,
      paddingBottom: theme.SH?.(12) ?? 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border ?? '#eee',
    },
    modalTitle: {
      fontSize: theme.fontSize?.lg ?? 18,
      fontFamily: theme.fonts?.BOLD,
      color: theme.colors.text,
    },
    modalCloseBtn: {
      padding: theme.SW?.(4) ?? 4,
    },
    modalCloseText: {
      fontSize: theme.fontSize?.xxl ?? 24,
      color: theme.colors.text,
      lineHeight: theme.fontSize?.xxl ?? 24,
    },
    modalBody: {
      paddingHorizontal: theme.SW?.(20) ?? 20,
      paddingTop: theme.SH?.(16) ?? 16,
    },
    submitBtn: {
      marginTop: theme.SH?.(20) ?? 20,
      marginBottom: theme.SH?.(8) ?? 8,
    },
  });
