import { View, StyleSheet } from 'react-native'
import { useMemo, useState } from 'react'
import { Container, AppHeader, CustomButton, CustomInput, CustomText, showToast } from '@components';
import { ThemeType, useThemeContext } from '@utils/theme';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { SH } from '@utils/dimensions';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import regex from '@utils/regexList';
import imagePaths from '@assets';
import { useChangePassword } from '@services/index';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function ChangePassword() {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [showCurrPass, setShowCurrPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);


  const validationSchema = Yup.object().shape({
    currpassword: Yup.string()
      .required(t('validation.emptyCurrPassword'))
      .matches(regex.PASSWORD, t('validation.passValid')),
    npassword: Yup.string()
      .required(t('validation.emptyNewPassword'))
      .matches(regex.PASSWORD, t('validation.passValid')),
    confirmpassword: Yup.string()
      .required(t('validation.emptyConfirmPassword'))
      .oneOf([Yup.ref('npassword')], t('validation.notMatchConfirmPassword')),
  });

  const changePasswordMutation = useChangePassword();
  const formik = useFormik({
    initialValues: {
      currpassword: '',
      npassword: '',
      confirmpassword: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      console.log('values', values);
      let data = {
        oldPassword: values.currpassword,
        newPassword: values.npassword,
      }
      try {
        const response = await changePasswordMutation.mutateAsync(data);
        if (response.succeeded && response.ResponseCode === 200) {
          showToast({
            type: 'success',
            title: t('messages.success'),
            message: response.ResponseMessage || t('messages.passwordUpdated'),
          });
          setTimeout(() => {
            navigation.goBack();
          }, 1000);
        } else {
          showToast({
            type: 'error',
            title: t('messages.error'),
            message: response.ResponseMessage || t('messages.somethingWentWrong'),
          });
        }
        console.log('response', response);
      } catch (error) {
        console.log('error', error);
      }
    },
  });

  return (
    <Container safeArea={true} style={styles.container}>
      <AppHeader
        title={t('profile.changePassword')}
        onLeftPress={() => navigation.goBack()}
      />
   <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
        enableOnAndroid={false}
        extraScrollHeight={100}
        keyboardShouldPersistTaps="handled"
        enableResetScrollToCoords={false}
      >
        <View style={styles.formSection}>
          <View style={styles.inputContainer}>
            <CustomText style={styles.label}>
              {t('profile.changePasswordDetails.currentPassword')}
            </CustomText>
            <CustomInput
              placeholder={t('profile.changePasswordDetails.currentPasswordPlaceholder')}
              value={formik.values.currpassword}
              onChangeText={formik.handleChange('currpassword')}
              onBlur={formik.handleBlur('currpassword')}
              withBackground={theme.colors.white}
              errortext={formik.touched.currpassword && formik.errors.currpassword ? formik.errors.currpassword : ''}
              marginTop={0}
              secureTextEntry={!showCurrPass}
              rightIcon={!showCurrPass ? imagePaths.eye_off_icon : imagePaths.eye_open}
              onRightIconPress={() => setShowCurrPass(!showCurrPass)}
            />
          </View>

          <View style={styles.inputContainer}>
            <CustomText style={styles.label}>
              {t('profile.changePasswordDetails.newPassword')}
            </CustomText>
            <CustomInput
              placeholder={t('profile.changePasswordDetails.newPasswordPlaceholder')}
              value={formik.values.npassword}
              onChangeText={formik.handleChange('npassword')}
              onBlur={formik.handleBlur('npassword')}
              withBackground={theme.colors.white}
              errortext={formik.touched.npassword && formik.errors.npassword ? formik.errors.npassword : ''}
              marginTop={0}
              secureTextEntry={!showNewPass}
              rightIcon={!showNewPass ? imagePaths.eye_off_icon : imagePaths.eye_open}
              onRightIconPress={() => setShowNewPass(!showNewPass)}
            />
          </View>

          <View style={styles.inputContainer}>
            <CustomText style={styles.label}>
              {t('profile.changePasswordDetails.confirmPassword')}
            </CustomText>
            <CustomInput
              placeholder={t('profile.changePasswordDetails.confirmPasswordPlaceholder')}
              value={formik.values.confirmpassword}
              onBlur={formik.handleBlur('confirmpassword')}
              onChangeText={formik.handleChange('confirmpassword')}
              errortext={formik.touched.confirmpassword && formik.errors.confirmpassword ? formik.errors.confirmpassword : ''}
              withBackground={theme.colors.white}
              marginTop={0}
              secureTextEntry={!showConfirmPass}
              rightIcon={
                !showConfirmPass
                  ? imagePaths.eye_off_icon
                  : imagePaths.eye_open
              }
              onRightIconPress={() => setShowConfirmPass(!showConfirmPass)}
            />
          </View>
        </View>
        <CustomButton
          title={t('profile.changePasswordDetails.update')}
          onPress={formik.handleSubmit}
          buttonStyle={styles.updateButton}
          buttonTextStyle={styles.updateButtonText}
          isLoading={changePasswordMutation.isPending}
          disable={changePasswordMutation.isPending}
        />
      </KeyboardAwareScrollView>


    </Container>
  );
}

const createStyles = (theme: ThemeType) => StyleSheet.create({
  scrollViewContent: {
  flexGrow: 1,
  },
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
  updateButtonContainer: {
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
  updateButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
  },
  updateButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontFamily: theme.fonts.BOLD,
  },
});

