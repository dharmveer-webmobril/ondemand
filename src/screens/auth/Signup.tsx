import imagePaths from '@assets';
import {
  AuthBottomContainer,
  Container,
  CustomButton,
  CustomInput,
  CustomText,
  ImageComp,
  OrText,
  VectoreIcons,
  showToast,
} from '@components';
import PhoneCountryPicker from '@components/auth/PhoneCountryPicker';
import { SCREEN_NAMES } from '@navigation';
import { SignupStyle } from '@styles/screens';
import { navigate } from '@utils/NavigationUtils';
import { useThemeContext } from '@utils/theme';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSignup } from '@services/api/queries/authQueries';
import { KeyboardFormScroll } from '@components/common';
import regex from '@utils/regexList';
import { isValidNationalPhoneNumber } from '@utils/phoneValidation';
import type { SignupAddressSelection } from '@utils/address';

const Signup = () => {
  const theme = useThemeContext();
  const { t } = useTranslation();
  const styles = SignupStyle(theme);
  const [passwordVisibility, setPasswordVisibility] = useState(true);
  const [confirmPasswordVisibility, setConfirmPasswordVisibility] =
    useState(true);
  const [checked, setChecked] = useState(false);
  const insets = useSafeAreaInsets();
  const statusBarHeight = insets.top;

  const signupMutation = useSignup();

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .min(3, t('validation.fullNameMinLength'))
      .matches(regex.NAME_REGEX, t('validation.validFullName'))
      .required(t('validation.emptyFullName')),
    email: Yup.string()
      .email(t('validation.validEmail'))
      .required(t('validation.emptyEmail')),
    phoneDialCode: Yup.string().required(),
    phoneCountryIso2: Yup.string().required(),
    nationalNumber: Yup.string()
      .required(t('validation.emptyMobile'))
      .test('phone-valid', t('validation.validMobile'), function (value) {
        const iso = this.parent.phoneCountryIso2;
        if (!iso || value == null || value === '') return false;
        return isValidNationalPhoneNumber(String(value), String(iso));
      }),
    password: Yup.string()
      .matches(regex.PASSWORD, t('validation.passValid'))
      .required(t('validation.emptyPassword')),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], t('validation.notMatchConfirmPassword'))
      .required(t('validation.emptyConfirmPassword')),
    address: Yup.object({
      formattedAddress: Yup.string().trim().required(),
      cityName: Yup.string().trim().required(),
      countryName: Yup.string().trim().required(),
      countryIso2: Yup.string().trim().required(),
      pincode: Yup.string().trim(),
      coordinates: Yup.object({
        lat: Yup.number().required(),
        lng: Yup.number().required(),
      }).required(),
    })
      .nullable()
      .required(t('signup.addressRequired')),
    acceptTerms: Yup.boolean()
      .oneOf([true], t('messages.acceptTermCond'))
      .required(t('messages.acceptTermCond')),
  });

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      phoneDialCode: '+91',
      phoneCountryIso2: 'in',
      nationalNumber: '',
      password: '',
      confirmPassword: '',
      address: null as SignupAddressSelection | null,
      acceptTerms: false,
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const addr = values.address;
      if (!addr) {
        showToast({
          type: 'error',
          title: t('messages.error'),
          message: t('signup.addressRequired'),
        });
        setSubmitting(false);
        return;
      }

      const nationalDigits = String(values.nationalNumber || '').replace(
        /\D/g,
        '',
      );
      const dial = String(values.phoneDialCode || '').replace(/\s/g, '');
      const phoneCode = dial
        ? dial.startsWith('+')
          ? dial
          : `+${dial.replace(/^\++/, '')}`
        : '';

      try {
        const signupData = {
          name: values.name,
          email: values.email,
          password: values.password,
          contact: nationalDigits,
          phoneCode,
          formattedAddress: addr.formattedAddress,
          googlePlaceId: addr.googlePlaceId,
          coordinates: addr.coordinates,
          cityName: addr.cityName,
          countryName: addr.countryName,
          countryIso2: addr.countryIso2,
          pincode: addr.pincode,
        };

        const response = await signupMutation.mutateAsync(signupData);

        if (response.succeeded && response.ResponseCode === 201) {
          showToast({
            type: 'success',
            title: t('messages.success'),
            message: t('messages.regSuccessMsg'),
          });
          const rd = response.ResponseData as {
            email?: string;
            customerId?: string;
            otp?: string;
          };
          navigate(SCREEN_NAMES.OTP_VERIFY, {
            prevScreen: 'signup',
            email: rd?.email,
            customerId: rd?.customerId,
            otp: rd?.otp,
          });
        } else {
          showToast({
            type: 'error',
            title: t('messages.error'),
            message:
              response.ResponseMessage || t('messages.somethingWentWrong'),
          });
        }
      } catch (error: any) {
        console.error('Signup error:', error);
        const errorMessage =
          error?.response?.data?.ResponseMessage ||
          error?.message ||
          t('messages.signupFailed');
        showToast({
          type: 'error',
          title: t('messages.error'),
          message: errorMessage || t('messages.somethingWentWrong'),
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleFormSubmit = () => {
    formik.setTouched({
      name: true,
      email: true,
      phoneDialCode: true,
      phoneCountryIso2: true,
      nationalNumber: true,
      password: true,
      confirmPassword: true,
      address: true,
      acceptTerms: true,
    });

    formik.validateForm().then(errors => {
      if (Object.keys(errors).length === 0) {
        formik.handleSubmit();
      }
    });
  };

  const navigateToAddress = () => {
    navigate(SCREEN_NAMES.ADD_ADDRESS, {
      addData: formik.values.address,
      prevScreen: 'signup',
      onDone: (address: SignupAddressSelection) => {
        formik.setFieldValue('address', address);
        setTimeout(() => formik.setFieldTouched('address', true), 100);
      },
    });
  };

  return (
    <Container
      safeArea={false}
      statusBarColor={theme.colors.white}
      style={{ backgroundColor: theme.colors.white }}
    >
      <KeyboardFormScroll contentContainerStyle={styles.contentContainer}>
        <ImageComp
          imageSource={imagePaths.signup_img}
          marginLeft={'auto'}
          marginRight={'auto'}
          marginBottom={20}
          height={theme.SH(150)}
          width={theme.SW(150)}
          marginTop={10 + statusBarHeight}
        />
        <AuthBottomContainer
          style={{
            paddingVertical: theme.SH(40),
            paddingHorizontal: theme.SW(25),
          }}
        >
          <CustomInput
            leftIcon={imagePaths.user123}
            placeholder={t('placeholders.fullname')}
            errortext={
              formik.touched.name && formik.errors.name
                ? formik.errors.name
                : ''
            }
            inputTheme={'white'}
            value={formik.values.name}
            onChangeText={formik.handleChange('name')}
            onBlur={formik.handleBlur('name')}
            maxLength={70}
          />

          <PhoneCountryPicker
            marginTop={theme.SH(15)}
            dialCode={formik.values.phoneDialCode}
            nationalNumber={formik.values.nationalNumber}
            onSelectionChange={next => {
              formik.setFieldValue('phoneDialCode', next.dialCode);
              formik.setFieldValue('phoneCountryIso2', next.countryIso2);
            }}
            onNationalNumberChange={digits =>
              formik.setFieldValue('nationalNumber', digits)
            }
            onNationalBlur={() => {
              formik.setFieldTouched('nationalNumber', true);
            }}
            phonePlaceholder={t('placeholders.mobileno')}
            errorText={
              formik.touched.nationalNumber && formik.errors.nationalNumber
                ? (formik.errors.nationalNumber as string)
                : ''
            }
          />

          <CustomInput
            leftIcon={imagePaths.email_icon}
            placeholder={t('placeholders.email')}
            errortext={
              formik.touched.email && formik.errors.email
                ? formik.errors.email
                : ''
            }
            inputTheme={'white'}
            value={formik.values.email}
            onChangeText={formik.handleChange('email')}
            onBlur={formik.handleBlur('email')}
            marginTop={theme.SH(15)}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={styles.addressFieldContainer}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('signup.addressLabel')}
              onPress={navigateToAddress}
              style={({ pressed }) => [
                styles.addressPicker,
                pressed && styles.addressPickerPressed,
              ]}
            >
              <VectoreIcons
                name="location-outline"
                icon="Ionicons"
                size={theme.SF(20)}
                color={theme.colors.white}
                style={styles.addressIconLeft}
              />

              <View style={styles.addressTextMiddle}>
                <CustomText
                  fontSize={theme.fontSize.sm}
                  fontFamily={theme.fonts.MEDIUM}
                  color={theme.colors.whitetext}
                  numberOfLines={2}
                  style={
                    formik.values.address?.formattedAddress
                      ? styles.addressRowValue
                      : styles.addressRowLabel
                  }
                >
                  {formik.values.address?.formattedAddress ||
                    t('signup.addressLabel')}
                </CustomText>
              </View>

              <VectoreIcons
                name="chevron-forward-outline"
                icon="Ionicons"
                size={theme.SF(20)}
                color={theme.colors.white}
                style={styles.addressIconChevron}
              />
            </Pressable>
          </View>
          {formik.touched.address && formik.errors.address && (
            <View style={styles.addressErrorContainer}>
              <CustomText style={styles.addressErrorText}>
                {typeof formik.errors.address === 'string'
                  ? formik.errors.address
                  : t('signup.addressRequired')}
              </CustomText>
            </View>
          )}

          <CustomInput
            leftIcon={imagePaths.lock_icon}
            placeholder={t('placeholders.password')}
            errortext={
              formik.touched.password && formik.errors.password
                ? formik.errors.password
                : ''
            }
            inputTheme={'white'}
            secureTextEntry={passwordVisibility}
            value={formik.values.password}
            onChangeText={formik.handleChange('password')}
            onBlur={formik.handleBlur('password')}
            onRightIconPress={() => setPasswordVisibility(!passwordVisibility)}
            rightIcon={
              !passwordVisibility
                ? imagePaths.eye_open
                : imagePaths.eye_off_icon
            }
            marginTop={theme.SH(15)}
          />

          <CustomInput
            leftIcon={imagePaths.lock_icon}
            placeholder={t('placeholders.reEnterPassword')}
            errortext={
              formik.touched.confirmPassword && formik.errors.confirmPassword
                ? formik.errors.confirmPassword
                : ''
            }
            maxLength={20}
            inputTheme={'white'}
            secureTextEntry={confirmPasswordVisibility}
            value={formik.values.confirmPassword}
            onChangeText={formik.handleChange('confirmPassword')}
            onBlur={formik.handleBlur('confirmPassword')}
            rightIcon={
              !confirmPasswordVisibility
                ? imagePaths.eye_open
                : imagePaths.eye_off_icon
            }
            onRightIconPress={() =>
              setConfirmPasswordVisibility(!confirmPasswordVisibility)
            }
            marginTop={theme.SH(15)}
          />

          <View style={styles.checkBoxContainer}>
            <Pressable
              onPress={() => {
                setChecked(!checked);
                formik.setFieldValue('acceptTerms', !checked);
              }}
              style={styles.checkboxMargin}
            >
              {!checked ? (
                <VectoreIcons
                  icon="Feather"
                  color={theme.colors.white}
                  name="square"
                  size={theme.SW(28)}
                />
              ) : (
                <VectoreIcons
                  icon="Feather"
                  color={theme.colors.white}
                  name="check-square"
                  size={theme.SW(28)}
                />
              )}
            </Pressable>
            <CustomText
              fontSize={theme.fontSize.xs}
              color={theme.colors.whitetext}
              fontFamily={theme.fonts.MEDIUM}
              style={styles.acceptTermsText}
            >
              {t('signup.acceptTerms')}
              <CustomText
                fontSize={theme.SF(14)}
                fontFamily={theme.fonts.MEDIUM}
                color={theme.colors.whitetext}
                onPress={() => {
                  navigate(SCREEN_NAMES.TERMS_AND_CONDITIONS, {
                    type: 'Terms and Condition',
                  });
                }}
              >
                {' '}
                {t('signup.termsOfService')}
              </CustomText>
              <CustomText
                fontSize={theme.SF(14)}
                fontFamily={theme.fonts.MEDIUM}
                color={theme.colors.whitetext}
                onPress={() => {
                  navigate(SCREEN_NAMES.TERMS_AND_CONDITIONS, {
                    type: 'Privacy Policies',
                  });
                }}
              >
                {' \n'}and {t('signup.privacyPolicy')}
              </CustomText>
            </CustomText>
          </View>
          {formik.touched.acceptTerms && formik.errors.acceptTerms && (
            <View style={{ marginTop: theme.SH(5), marginLeft: theme.SW(5) }}>
              <CustomText
                fontSize={theme.fontSize.xxs}
                color={theme.colors.errorText || '#FF0000'}
              >
                {formik.errors.acceptTerms}
              </CustomText>
            </View>
          )}
          <CustomButton
            title={t('signup.signUpButton')}
            backgroundColor={theme.colors.white}
            textColor={theme.colors.primary}
            marginTop={theme.SH(40)}
            onPress={handleFormSubmit}
            isLoading={signupMutation.isPending || formik.isSubmitting}
            disable={signupMutation.isPending || formik.isSubmitting}
          />

          <OrText />

          <View style={{ alignItems: 'center', marginTop: theme.SH(20) }}>
            <CustomText
              fontSize={theme.fontSize.sm}
              color={theme.colors.whitetext}
            >
              {t('signup.alreadyHaveAccount')}{' '}
              <CustomText
                onPress={() => {
                  navigate(SCREEN_NAMES.LOGIN);
                }}
                fontSize={theme.fontSize.md}
                fontFamily={theme.fonts.SEMI_BOLD}
                color={theme.colors.whitetext}
              >
                {t('signup.logIn')}{' '}
              </CustomText>
            </CustomText>
          </View>
        </AuthBottomContainer>
      </KeyboardFormScroll>
    </Container>
  );
};

export default Signup;
