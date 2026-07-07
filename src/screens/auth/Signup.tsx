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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSignup } from '@services/api/queries/authQueries';
import { useValidateReferralCode } from '@services/api/queries/referralQueries';
import { KeyboardFormScroll } from '@components/common';
import regex from '@utils/regexList';
import { isValidNationalPhoneNumber } from '@utils/phoneValidation';
import type { SignupAddressSelection } from '@utils/address';

function sanitizeReferralCode(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8);
}

function normalizeCountryIso2(iso?: string | null): string {
  return String(iso || '').trim().toLowerCase();
}

function signupAddressMatchesPhoneCountry(
  phoneCountryIso2: string,
  addressCountryIso2: string | undefined,
): boolean {
  const phone = normalizeCountryIso2(phoneCountryIso2);
  const address = normalizeCountryIso2(addressCountryIso2);
  if (!phone || !address) return true;
  return phone === address;
}

const Signup = () => {
  const route = useRoute<any>();
  const theme = useThemeContext();
  const { t } = useTranslation();
  const styles = SignupStyle(theme);
  const [passwordVisibility, setPasswordVisibility] = useState(true);
  const [confirmPasswordVisibility, setConfirmPasswordVisibility] =
    useState(true);
  const [checked, setChecked] = useState(false);
  const [isReferralValid, setIsReferralValid] = useState(false);
  const [referralApiError, setReferralApiError] = useState('');
  const [isValidatingReferral, setIsValidatingReferral] = useState(false);
  const insets = useSafeAreaInsets();
  const statusBarHeight = insets.top;

  const signupMutation = useSignup();
  const validateReferralMutation = useValidateReferralCode();
  const appliedReferralRef = useRef<string | null>(null);

  const validationSchema = useMemo(
    () =>
      Yup.object().shape({
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
        referralCode: Yup.string()
          .test('referral-length', t('referral.codeLength'), value => {
            if (!value) return true;
            return value.length === 8;
          })
          .test('referral-valid', t('referral.codeInvalid'), value => {
            if (!value) return true;
            if (value.length !== 8) return false;
            return isReferralValid;
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
      }),
    [isReferralValid, t],
  );

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      phoneDialCode: '+91',
      phoneCountryIso2: 'in',
      nationalNumber: '',
      referralCode: sanitizeReferralCode(String(route.params?.ref || '')),
      password: '',
      confirmPassword: '',
      address: null as SignupAddressSelection | null,
      acceptTerms: false,
    },
    validationSchema,
    enableReinitialize: false,
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

      if (
        !signupAddressMatchesPhoneCountry(
          values.phoneCountryIso2,
          addr.countryIso2,
        )
      ) {
        showToast({
          type: 'error',
          title: t('messages.error'),
          message: t('signup.addressCountryMismatch'),
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
          ...(values.referralCode && isReferralValid
            ? { referralCode: values.referralCode }
            : {}),
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
          };
          navigate(SCREEN_NAMES.OTP_VERIFY, {
            prevScreen: 'signup',
            email: rd?.email ?? values.email,
            customerId: rd?.customerId,
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

  const validateReferralCode = useCallback(
    async (code: string) => {
      if (code.length !== 8) return;

      setIsValidatingReferral(true);
      setReferralApiError('');
      setIsReferralValid(false);

      try {
        const response = await validateReferralMutation.mutateAsync({
          referralCode: code,
          userType: 'customer',
        });

        if (response.succeeded) {
          setIsReferralValid(true);
          setReferralApiError('');
        } else {
          setIsReferralValid(false);
          setReferralApiError(
            response.ResponseMessage || t('referral.codeInvalid'),
          );
        }
      } catch (error: any) {
        setIsReferralValid(false);
        setReferralApiError(
          error?.response?.data?.ResponseMessage ||
            error?.message ||
            t('referral.codeInvalid'),
        );
      } finally {
        setIsValidatingReferral(false);
      }
    },
    [t, validateReferralMutation],
  );

  const handleReferralCodeChange = useCallback(
    (text: string) => {
      const sanitized = sanitizeReferralCode(text);
      formik.setFieldValue('referralCode', sanitized);

      if (sanitized.length !== 8) {
        setIsReferralValid(false);
        setReferralApiError('');
        setIsValidatingReferral(false);
        return;
      }

      void validateReferralCode(sanitized);
    },
    [formik, validateReferralCode],
  );

  useEffect(() => {
    const prefilled = sanitizeReferralCode(String(route.params?.ref || ''));
    if (prefilled.length !== 8 || appliedReferralRef.current === prefilled) {
      return;
    }
    appliedReferralRef.current = prefilled;
    void validateReferralCode(prefilled);
  }, [route.params?.ref, validateReferralCode]);

  const referralErrorText = useMemo(() => {
    if (formik.touched.referralCode && formik.errors.referralCode) {
      return String(formik.errors.referralCode);
    }
    if (referralApiError) return referralApiError;
    return '';
  }, [
    formik.touched.referralCode,
    formik.errors.referralCode,
    referralApiError,
  ]);

  const handleFormSubmit = () => {
    if (isValidatingReferral) return;

    formik.setTouched({
      name: true,
      email: true,
      phoneDialCode: true,
      phoneCountryIso2: true,
      nationalNumber: true,
      referralCode: true,
      password: true,
      confirmPassword: true,
      address: true,
      acceptTerms: true,
    });

    formik.validateForm().then(errors => {
      if (Object.keys(errors).length === 0) {
        if (
          formik.values.address &&
          !signupAddressMatchesPhoneCountry(
            formik.values.phoneCountryIso2,
            formik.values.address.countryIso2,
          )
        ) {
          showToast({
            type: 'error',
            title: t('messages.error'),
            message: t('signup.addressCountryMismatch'),
          });
          return;
        }
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
      <KeyboardFormScroll 
      contentContainerStyle={styles.contentContainer}
      >
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
            paddingBottom: theme.SH(90),
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

          <View>
            <CustomInput
              placeholder={t('signup.referralCodePlaceholder')}
              errortext={referralErrorText}
              inputTheme={'white'}
              value={formik.values.referralCode}
              onChangeText={handleReferralCodeChange}
              onBlur={formik.handleBlur('referralCode')}
              marginTop={theme.SH(15)}
              maxLength={8}
              autoCapitalize="characters"
            />
            {isValidatingReferral ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: theme.SH(6),
                  gap: theme.SW(8),
                }}
              >
                <ActivityIndicator
                  size="small"
                  color={theme.colors.white}
                />
                <CustomText
                  fontSize={theme.fontSize.xxs}
                  color={theme.colors.whitetext}
                >
                  {t('referral.validating')}
                </CustomText>
              </View>
            ) : null}
            {!isValidatingReferral &&
            formik.values.referralCode.length === 8 &&
            isReferralValid ? (
              <CustomText
                fontSize={theme.fontSize.xxs}
                color={theme.colors.success || '#86efac'}
                marginTop={5}
              >
                {t('referral.codeValid')}
              </CustomText>
            ) : null}
          </View>

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
              {t('signup.acceptTerms')}{' '}
              <CustomText
                style={{
                  marginLeft: theme.SW(5),
                  textDecorationLine: 'underline',
                  fontSize: theme.SF(13),
                  fontFamily: theme.fonts.MEDIUM,
                  color: theme.colors.whitetext,
                }}
                onPress={() => {
                  navigate(SCREEN_NAMES.TERMS_AND_CONDITIONS, {
                    type: 'Terms and Condition',
                  });
                }}
              >
                {t('signup.termsOfService')}
              </CustomText>
              <CustomText
                style={{
                  marginLeft: theme.SW(5),
                  fontSize: theme.SF(13),
                  fontFamily: theme.fonts.MEDIUM,
                  color: theme.colors.whitetext,
                }}
                
              >
                {'\n'}
                {t('signup.andText')}{' '}
              </CustomText>
              <CustomText
                style={{
                  marginLeft: theme.SW(5),
                  textDecorationLine: 'underline',
                  fontSize: theme.SF(13),
                  fontFamily: theme.fonts.MEDIUM,
                  color: theme.colors.whitetext,
                }}
                onPress={() => {
                  navigate(SCREEN_NAMES.TERMS_AND_CONDITIONS, {
                    type: 'Privacy Policies',
                  });
                }}
              >
                {t('signup.privacyPolicy')}
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
            isLoading={
              signupMutation.isPending ||
              formik.isSubmitting ||
              isValidatingReferral
            }
            disable={
              signupMutation.isPending ||
              formik.isSubmitting ||
              isValidatingReferral
            }
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
