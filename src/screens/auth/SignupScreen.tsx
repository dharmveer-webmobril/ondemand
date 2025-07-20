import React, { useState } from 'react';
import {
  Keyboard,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import {
  Colors,
  Fonts,
  handleApiError,
  handleApiFailureResponse,
  handleSuccessToast,
  regex,
  SF,
  SH,
  StorageProvider,
  SW,
} from '../../utils';
import {
  AppText,
  AuthBottomContainer,
  AuthImgComp,
  Container,
  InputField,
  showAppToast,
  Spacing,
  VectoreIcons,
} from '../../component';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import imagePaths from '../../assets/images';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Buttons from '../../component/Button';
import { useNavigation } from '@react-navigation/native';
import RouteName from '../../navigation/RouteName';
import { useTranslation } from 'react-i18next';

import DeviceInfo from 'react-native-device-info';
import { useRegisterMutation } from '../../redux';

type SignupProps = {};

const SignupScreen: React.FC<SignupProps> = ({ }) => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [passwordVisibility, setpasswordVisibility] = useState(true);
  const [cpasswordVisibility, setcpasswordVisibility] = useState(true);
  const [checked, setChecked] = useState(false);
  const toggleCheckbox = () => setChecked(!checked);


  const validationSchema = Yup.object().shape({
    fname: Yup.string()
      .required(t('validation.emptyFullName'))
      .min(3, t('validation.fullNameMinLength'))
      .matches(regex.NAME_REGEX, t('validation.validFullName')),
    email: Yup.string()
      .matches(regex.EMAIL_REGEX_WITH_EMPTY, t('validation.validEmail'))
      .required(t('validation.emptyEmail')),
    mobileno: Yup.string()
      .matches(regex.MOBIILE, t('validation.validMobile'))
      .required(t('validation.emptyMobile')),
    password: Yup.string()
      .required(t('validation.emptyPassword'))
      .matches(regex.PASSWORD, t('validation.passValid')),
    cpassword: Yup.string()
      .required(t('validation.emptyConfirmPassword'))
      .oneOf([Yup.ref('password')], t('validation.notMatchConfirmPassword')),
  });

  const [register, {  isLoading }] = useRegisterMutation();

  const btnSignup = async (
    values: { email: string; password: string; cpassword: string; fname: string; mobileno: string; },
    resetForm: any,
  ) => {
    try {
      const fcmToken = await StorageProvider.getItem('fcmToken') || null;
      const device_id = await DeviceInfo.getUniqueId() || 'device_1';
      if (!checked) {
        showAppToast({
          title: 'Error',
          message: 'Please accept term of service',
          type: 'error',
          timeout: 2500,
        });
        return false
      };
      let userData = {
        email: values.email,
        password: values.password,
        fullName: values.fname,
        mobileNo: values.mobileno,
        countryCode: "+91",
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
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContainer}
        enableOnAndroid={true} // Important for Android
        extraScrollHeight={50} // Adjusts scroll height when keyboard appears
        keyboardShouldPersistTaps="handled" // Allows tap on input when keyboard is open
        resetScrollToCoords={{ x: 0, y: 0 }}
      >
        <Spacing space={SH(40)} />
        <AuthImgComp icon={imagePaths.signup_img} />
        <AuthBottomContainer>
          <View style={styles.gradientContainer}>
            <Formik
              initialValues={{
                email: '',
                password: '',
                cpassword: '',
                fname: '',
                mobileno: '',
              }}
              validationSchema={validationSchema}
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

                  <InputField
                    placeholder={t('placeholders.fullname')}
                    value={values.fname}
                    onChangeText={handleChange('fname')}
                    onBlur={() => setFieldValue('fname', values.fname.trim())}
                    leftIcon={imagePaths.email_icon}
                    errorMessage={touched.fname && errors.fname && errors.fname ? errors.fname : ''}
                    keyboardType="default"
                  />

                  <InputField
                    placeholder={t('placeholders.mobileno')}
                    value={values.mobileno}
                    onChangeText={handleChange('mobileno')}
                    onBlur={() => setFieldValue('mobileno', values.mobileno.trim())}
                    leftIcon={imagePaths.mobile_icon}
                    errorMessage={touched.mobileno && errors.mobileno && errors.mobileno ? errors.mobileno : ''}
                    keyboardType={'number-pad'}
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
                    onBlur={() => setFieldTouched('cpassword')}
                    leftIcon={imagePaths.lock_icon}
                    errorMessage={touched.cpassword && errors.cpassword && errors.cpassword ? errors.cpassword : ''}
                    rightIcon={!cpasswordVisibility ? imagePaths.eye_open : imagePaths.eye_off_icon}
                    onRightIconPress={() => setcpasswordVisibility(!cpasswordVisibility)}
                    secureTextEntry={cpasswordVisibility}
                    keyboardType={'default'}
                  />


                  <Spacing space={SH(10)} />
                  {/* check box==============================    */}
                  <View style={styles.checkBoxContainer}>
                    <Pressable onPress={() => { toggleCheckbox() }} style={styles.checkboxPressable}>
                      {
                        !checked ?
                          <VectoreIcons
                            icon="Ionicons"
                            color={Colors.white}
                            name="square-outline"
                            size={SW(24)}
                          />
                          :
                          <VectoreIcons
                            icon="Ionicons"
                            color={Colors.white}
                            name="checkbox-outline"
                            size={SW(24)}
                          />
                      }
                    </Pressable>
                    <AppText style={styles.consfirmTxt}>
                      {t('signup.acceptTerms')}{' '}
                      <AppText
                        onPress={() => {
                          // navigation.navigate(RouteName.PRIVACY_POLICY, {
                          //   title: 'Terms of Service',
                          // });
                        }}
                        style={{ fontSize: SF(12), fontFamily: Fonts.SEMI_BOLD }}>
                        {t('signup.termsOfService')}
                      </AppText>{' '}
                      & {'\n'}
                      <AppText
                        onPress={() => {
                          // navigation.navigate(RouteName.PRIVACY_POLICY, {
                          //   title: 'Privacy Policy',
                          // });
                        }}
                        style={{ fontSize: SF(12), fontFamily: Fonts.SEMI_BOLD }}>
                        {t('signup.privacyPolicy')}
                      </AppText>
                    </AppText>
                  </View>

                  <Spacing space={SH(25)} />

                  <Buttons
                    buttonStyle={styles.buttonContainer}
                    textColor={Colors.themeColor}
                    title={t('signup.signUpButton')}
                    onPress={() => {
                      handleSubmit();
                      Keyboard.dismiss();
                    }}
                    isLoading={isLoading}
                  />
                  {/* <Image source={imagePaths.face_lock} style={styles.fingerPrintImage} /> */}

                  <AppText style={styles.dontHaveAccTxt}>
                    {t('signup.alreadyHaveAccount')}{' '}
                    <AppText
                      onPress={() => {
                        navigation.navigate(RouteName.LOGIN);
                      }}
                      style={styles.dontHaveAccLogintxt}>
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
  scrollView: {
    flex: 1,
  },
  scrollViewContainer: {
    flexGrow: 1,
  },
  errorText: {
    color: 'red',
    fontSize: SF(12),
  },
  gradientContainer: { paddingVertical: SH(35), paddingHorizontal: SW(25) },
  buttonContainer: { backgroundColor: Colors.bgwhite, width: '93%', alignSelf: 'center' },
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

  fingerPrintImage: {
    height: SF(48),
    width: SF(48),
    resizeMode: "contain",
    alignSelf: "center",
    marginVertical: SH(14)
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
    fontSize: SF(12),
    textAlign: 'center',
    marginTop: SH(25)
  },
  dontHaveAccLogintxt: {
    fontFamily: Fonts.MEDIUM, fontSize: SF(14)
  },
  consfirmTxt: {
    color: Colors.textWhite,
    fontFamily: Fonts.MEDIUM,
    fontSize: SF(10),
  },
  checkBoxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  checkboxPressable: {
    marginRight: 10,
  },
});
