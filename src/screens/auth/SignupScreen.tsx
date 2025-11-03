import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Colors,
  commonStyles,
  Fonts,
  handleApiError,
  handleApiFailureResponse,
  handleSuccessToast,
  regex,
  SF,
  SH,
  signupValidationSchema,
  socialButtons,
  StorageProvider,
  SW,
} from '../../utils';
import {
  AppText,
  AuthBottomContainer,
  AuthImgComp,
  Container,
  CountryPickerComp,
  InputField,
  showAppToast,
  Spacing,
  VectoreIcons,
} from '../../component';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import imagePaths from '../../assets/images';
import { Formik, useFormikContext } from 'formik';
import Buttons from '../../component/Button';
import { useNavigation } from '@react-navigation/native';
import RouteName from '../../navigation/RouteName';
import { useTranslation } from 'react-i18next';
import DeviceInfo from 'react-native-device-info';
import { useRegisterMutation } from '../../redux';
import { countryCodes } from 'react-native-country-codes-picker';
import * as RNLocalize from 'react-native-localize';
const SCREEN_WIDTH = Dimensions.get('window').width
const SocialButton = ({
  icon,
  onPress,
  width = SW(40),
  iconSize = SH(26),
  height = SW(40),
}: {
  icon: any;
  onPress: () => void;
  width?: number;
  height?: number;
  iconSize?: number;
}) => (
  <TouchableOpacity
    activeOpacity={0.5}
    style={[styles.socialButton, { width, height }]}
    onPress={onPress}>
    <Image
      source={icon}
      style={{ width: iconSize, height: iconSize }}
      resizeMode="contain"
    />
  </TouchableOpacity>
);

type SignupProps = {};

const AutoDetectCountryCode = () => {
  const { setFieldValue } = useFormikContext<any>();

  useEffect(() => {
    const isoCode = RNLocalize.getCountry();
    console.log(RNLocalize.getCountry(), 'RNLocalizeRNLocalizeRNLocalize');
    console.log(countryCodes, 'countryCodescountryCodes');
    const locales = RNLocalize.getLocales();
    console.log(locales, 'localeslocales');
    const match = countryCodes.find((item) => item.code === isoCode.toUpperCase());
    const dialCode = match?.dial_code || '+91';
    setFieldValue('countryCode', dialCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

const SignupScreen: React.FC<SignupProps> = ({ }) => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [passwordVisibility, setpasswordVisibility] = useState(true);
  const [cpasswordVisibility, setcpasswordVisibility] = useState(true);
  const [checked, setChecked] = useState(false);
  const toggleCheckbox = () => setChecked(!checked);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const [register, { isLoading }] = useRegisterMutation();

  const btnSignup = async (
    values: { email: string; password: string; cpassword: string; fname: string; mobileno: string; countryCode: string },
    resetForm: any,
  ) => {

    if (!checked) {
      showAppToast({
        title: t('messages.error'),
        message: t('messages.acceptTermCond'),
        type: 'error',
        timeout: 2500,
      });
      return false
    };

    try {
      const fcmToken = await StorageProvider.getItem('fcmToken') || null;
      const device_id = await DeviceInfo.getUniqueId() || 'device_1';

      let userData = {
        email: values.email,
        password: values.password,
        fullName: values.fname,
        mobileNo: values.mobileno,
        countryCode: values.countryCode,
        deviceId: device_id,
        userFcmToken: fcmToken,
        providerFcmToken: null,
        roleType: 'user',
      };

      const response = await register(userData).unwrap();
      console.log('Signup Response:', response);

      if (response.success) {
        handleSuccessToast(response.message || t('messages.acceptTermCond'));

        const token = response?.data?.accessToken?.accessToken || response?.data?.accessToken;

        navigation.navigate(RouteName.OTP_VERIFY, {
          fromScreen: 'signup',
          userToken: token,
          otp: response.data.otp,
          email: values.email,
        });
        resetForm();
      } else {
        handleApiFailureResponse(response, t('messages.signupFailed'));
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  return (
    <Container
      isBackButton={true}
      onBackPress={() => {
        navigation.goBack();
      }}
      isAuth={true}
      style={styles.container}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.contentContainer}
        enableOnAndroid={true}
        extraScrollHeight={50}
        keyboardShouldPersistTaps="handled"
        resetScrollToCoords={{ x: 0, y: 0 }}
      >
        <Spacing space={SH(20)} />
        <AuthImgComp icon={imagePaths.signup_img} height={SF(130)} width={SF(130)} />
        <AuthBottomContainer>
          <View style={{ paddingVertical: SH(35), paddingHorizontal: SW(20) }}>
            <Formik
              initialValues={{
                email: '',
                password: '',
                cpassword: '',
                fname: '',
                mobileno: '',
                countryCode: '+91',
              }}
              validationSchema={signupValidationSchema(t, regex)}
              onSubmit={(values, { resetForm }) => {
                btnSignup(values, resetForm);
              }}>
              {({
                handleChange,
                setFieldTouched,
                setFieldValue,
                handleSubmit,
                values,
                errors,
                touched,
              }) => (
                <>
                  <AutoDetectCountryCode />
                  <InputField
                    placeholder={t('placeholders.fullname')}
                    value={values.fname}
                    onChangeText={handleChange('fname')}
                    onBlur={() => setFieldValue('fname', values.fname.trim())}
                    leftIcon={imagePaths.user123}
                    errorMessage={touched.fname && errors.fname && errors.fname ? errors.fname : ''}
                    maxLength={50}
                    keyboardType="default"
                  />

                  <View style={styles.rowContainer}>
                    <TouchableOpacity
                      onPress={() => setIsPickerOpen(true)}
                      style={[commonStyles.countryCodeBoxStyle]}>
                      <AppText style={{ color: Colors.white, fontFamily: Fonts.MEDIUM }}>
                        {values.countryCode}
                      </AppText>
                    </TouchableOpacity>

                    <View style={styles.flexOne}>
                      <InputField
                        placeholder={t('placeholders.mobileno')}
                        maxLength={15}
                        value={values.mobileno}
                        onChangeText={handleChange('mobileno')}
                        onBlur={() => setFieldValue('mobileno', values.mobileno.trim())}
                        leftIcon={imagePaths.mobile_icon}
                        keyboardType={'number-pad'}
                      />
                    </View>
                  </View>
                  {touched.mobileno && errors.mobileno && (
                    <AppText style={styles.errorText}>
                      {errors.mobileno}
                    </AppText>
                  )}
                  <CountryPickerComp
                    isPickerOpen={isPickerOpen}
                    closeCountryPicker={() => setIsPickerOpen(false)}
                    openCountryPicker={() => setIsPickerOpen(true)}
                    inputText={''}
                    onInputChange={() => { }}
                    countryCode={values.countryCode}
                    setCountryCode={(code: string) => setFieldValue('countryCode', code)}
                  />
                  <InputField
                    placeholder={t('placeholders.email')}
                    value={values.email}
                    onChangeText={handleChange('email')}
                    onBlur={() => setFieldValue('email', values.email.trim())}
                    leftIcon={imagePaths.email_icon}
                    errorMessage={touched.email && errors.email && errors.email ? errors.email : ''}
                    keyboardType={'email-address'}
                  />

                  <InputField
                    placeholder={t('placeholders.password')}
                    value={values.password}
                    onChangeText={handleChange('password')}
                    maxLength={20}
                    onBlur={() => setFieldTouched('password')}
                    leftIcon={imagePaths.lock_icon}
                    errorMessage={touched.password && errors.password && errors.password ? errors.password : ''}
                    rightIcon={!passwordVisibility ? imagePaths.eye_open : imagePaths.eye_off_icon}
                    onRightIconPress={() => setpasswordVisibility(!passwordVisibility)}
                    secureTextEntry={passwordVisibility}
                    keyboardType={'default'}
                  />
                  <InputField
                    placeholder={t('placeholders.reEnterPassword')}
                    value={values.cpassword}
                    onChangeText={handleChange('cpassword')}
                    maxLength={20}
                    onBlur={() => setFieldTouched('cpassword')}
                    leftIcon={imagePaths.lock_icon}
                    errorMessage={touched.cpassword && errors.cpassword && errors.cpassword ? errors.cpassword : ''}
                    rightIcon={!cpasswordVisibility ? imagePaths.eye_open : imagePaths.eye_off_icon}
                    onRightIconPress={() => setcpasswordVisibility(!cpasswordVisibility)}
                    secureTextEntry={cpasswordVisibility}
                    keyboardType={'default'}
                  />


                  <Spacing space={SH(20)} />
                  {/* check box==============================    */}
                  <View style={styles.checkBoxContainer}>
                    <Pressable onPress={() => { toggleCheckbox() }} style={styles.checkboxMargin}>
                      {
                        !checked ?
                          <VectoreIcons
                            icon="Feather"
                            color={Colors.white}
                            name="square"
                            size={SW(28)}
                          />
                          :
                          <VectoreIcons
                            icon="Feather"
                            color={Colors.white}
                            name="check-square"
                            size={SW(28)}
                          />
                      }
                    </Pressable>
                    <AppText style={styles.consfirmTxt}>
                      {t('signup.acceptTerms')}{' '}
                      <AppText
                        onPress={() => {
                          navigation.navigate(RouteName.PRIVACY_POLICY, {
                            title: 'Terms of Service',
                          });
                        }}
                        style={{ fontSize: SF(12), fontFamily: Fonts.SEMI_BOLD }}>
                        {t('signup.termsOfService')}
                      </AppText>{' '}
                      & {'\n'}
                      <AppText
                        onPress={() => {
                          navigation.navigate(RouteName.PRIVACY_POLICY, {
                            title: 'Privacy Policy',
                          });
                        }}
                        style={{ fontSize: SF(12), fontFamily: Fonts.SEMI_BOLD }}>
                        {t('signup.privacyPolicy')}
                      </AppText>
                    </AppText>
                  </View>

                  <Spacing space={SH(30)} />

                  <Buttons
                    buttonStyle={{ backgroundColor: Colors.bgwhite }}
                    textColor={Colors.themeColor}
                    title={t('signup.signUpButton')}
                    onPress={() => {
                      handleSubmit();
                      Keyboard.dismiss();
                    }}
                    isLoading={isLoading}
                  />

                  <Spacing space={SH(30)} />

                  <View style={styles.lineViewContainer}>
                    <View style={styles.leftRightLine} />
                    <AppText style={styles.ortext}>{t('signup.orText')}</AppText>
                    <View style={styles.leftRightLine} />
                  </View>

                  <Spacing space={SH(20)} />

                  <View style={styles.socialIconContainer}>
                    {socialButtons.map((button, index) => (
                      <SocialButton
                        key={index}
                        icon={button.icon}
                        width={(SCREEN_WIDTH * 0.4) / 4}
                        iconSize={SF(26)}
                        onPress={button.onPress}
                      />
                    ))}
                  </View>

                  <Spacing space={SH(15)} />

                  <AppText style={styles.dontHaveAccTxt}>
                    {t('signup.alreadyHaveAccount')}{' '}
                    <AppText
                      onPress={() => {
                        navigation.navigate(RouteName.LOGIN);
                      }}
                      style={{ fontFamily: Fonts.BOLD, fontSize: SF(16) }}>
                      {t('signup.logIn')}{' '}
                    </AppText>
                  </AppText>
                </>
              )}
            </Formik>
          </View>
        </AuthBottomContainer>

      </KeyboardAwareScrollView>
    </Container>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bgwhite,
  },
  errorText: {
    color: 'red',
    fontSize: SF(12),
    marginBottom: 7
  },
  submitButton: {
    color: Colors.textWhite,
    fontSize: SF(16),
    fontWeight: 'bold',
    paddingVertical: SH(10),
    paddingHorizontal: SW(20),
    backgroundColor: Colors.themeColor,
    borderRadius: SH(5),
    textAlign: 'center',
  },
  forgotPassTxt: {
    color: Colors.textWhite,
    fontFamily: Fonts.REGULAR,
    fontSize: SF(14),
    alignSelf: 'flex-end',
    textAlign: 'right',
  },
  lineViewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
  },
  leftRightLine: {
    height: 1,
    backgroundColor: Colors.white,
    width: SCREEN_WIDTH * 0.39,
  },
  ortext: {
    color: Colors.textWhite,
    fontFamily: Fonts.SEMI_BOLD,
    fontSize: SF(14),
    alignSelf: 'flex-end',
    textAlign: 'right',
  },
  socialButton: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: SW(10),
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  socialIconContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    justifyContent: 'space-between',
  },
  dontHaveAccTxt: {
    color: Colors.textWhite,
    fontFamily: Fonts.REGULAR,
    fontSize: SF(14),
    textAlign: 'center',
  },
  consfirmTxt: {
    color: Colors.textWhite,
    fontFamily: Fonts.MEDIUM,
    fontSize: SF(12),
  },
  checkBoxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  flexOne: {
    flex: 1,
  },
  checkboxMargin: {
    marginRight: 10,
  },
  contentContainer: {
    flexGrow: 1,
  },
});
