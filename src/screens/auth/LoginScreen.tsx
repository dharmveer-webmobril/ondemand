import React, { useContext, useState } from 'react';
import {
  Dimensions,
  Image,
  Keyboard,
  Platform,
  StyleSheet,
  TouchableOpacity,
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
  socialButtons,
  StorageProvider,
  SW,
  useDisableGestures,
  useProfileUpdate,
} from '../../utils';
import {
  AppText,
  AuthBottomContainer,
  AuthImgComp,
  Container,
  InputField,
  Spacing,
} from '../../component';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import imagePaths from '../../assets/images';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Buttons from '../../component/Button';
import { useNavigation } from '@react-navigation/native';
import RouteName from '../../navigation/RouteName';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { ChatContext } from '../ChatProvider';
import DeviceInfo from 'react-native-device-info';
import { setToken, useLoginMutation } from '../../redux';
const SCREEN_WIDTH = Dimensions.get('window').width
// import { API_URL, GOOGLE_API_KEY } from '@env';
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
      style={{ width: iconSize, height: iconSize, resizeMode: 'contain' }}
    />
  </TouchableOpacity>
);

type LoginProps = {};

const LoginScreen: React.FC<LoginProps> = ({ }) => {
  const navigation = useNavigation<any>();
  const [passwordVisibility, setpasswordVisibility] = useState(true);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  useDisableGestures();



  useProfileUpdate();

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .matches(regex.EMAIL_REGEX_WITH_EMPTY, t('validation.validEmail'))
      .required(t('validation.emptyEmail')),
    password: Yup.string()
      .required(t('validation.emptyPassword')),
  });

  // const chatContext = useContext(ChatContext);
  // if (!chatContext) return null;
  // const { createUser } = chatContext;


  const [login, { isLoading }] = useLoginMutation();

  const btnSignIn = async (
    values: { email: string; password: string },
    resetForm: any
  ) => {
    try {
      const fcmToken = await StorageProvider.getItem('fcmToken') || null;
      const device_id = await DeviceInfo.getUniqueId() || 'device_1';
      const device_type = Platform.OS === 'android' ? '1' : '2';

      let userData = {
        email: values.email,
        password: values.password,
        // Add optional metadata if needed later
      };

      const response = await login(userData).unwrap();
      console.log('Login Response:', response);

      if (response.success) {
        const token = response.data.accessToken;

        if (response.data.isStatus) {
          handleSuccessToast(response.message || 'Login successful');

          dispatch(setToken({ token }));
          StorageProvider.saveItem('token', token);
          resetForm()
          setTimeout(() => {
            navigation.navigate(RouteName.HOME);
          }, 200);

        } else if (response.data.otp) {
          handleSuccessToast(response.message || 'OTP sent to email');

          navigation.navigate(RouteName.OTP_VERIFY, {
            fromScreen: 'signup',
            userToken: token,
            email: values.email,
          });

        } else {
          handleApiFailureResponse(response, 'Account not verified.');
        }

      } else {
        handleApiFailureResponse(response, 'Login failed.');
      }

    } catch (error) {
      handleApiError(error);
    }
  };


  return (
    <Container isAuth={true} style={styles.container}>
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 0 }}
        showsVerticalScrollIndicator={false}
        extraScrollHeight={SH(40)}>
        <Spacing space={SH(40)} />

        <AuthImgComp icon={imagePaths.login_img} />

        <AuthBottomContainer>
          <View style={{ paddingVertical: SH(35), paddingHorizontal: SW(20) }}>
            <Formik
              initialValues={{
                email: 'dharm@mailinator.com',
                password: 'Qwerty@123',
                // email: '',
                // password: '',
              }}
              validationSchema={validationSchema}
              onSubmit={(values, { resetForm }) => {
                btnSignIn(values, resetForm);
              }}>
              {({
                handleChange,
                setFieldTouched,
                handleSubmit,
                values,
                errors,
                touched,
                setFieldValue
              }) => (
                <>
                  <InputField
                    placeholder={t('placeholders.email')}
                    value={values.email}
                    onChangeText={handleChange('email')}
                    onBlur={() => setFieldValue('email', values.email.trim())}
                    leftIcon={imagePaths.email_icon}
                    errorMessage={touched.email && errors.email && errors.email ? errors.email : ''}
                    keyboardType={'email-address'}
                  />
                  <Spacing space={SF(7)} />
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

                  <Spacing space={SF(8)} />

                  <AppText
                    onPress={() => {
                      navigation.navigate(RouteName.FORGOT_PASS);
                    }}
                    style={styles.forgotPassTxt}>
                    {t('login.forgotPassword')}
                  </AppText>

                  <Spacing space={SH(30)} />

                  <Buttons
                    buttonStyle={{ backgroundColor: Colors.bgwhite }}
                    textColor={Colors.themeColor}
                    title={t('login.loginButton')}
                    onPress={() => {
                      handleSubmit();
                      Keyboard.dismiss();
                    }}
                    isLoading={isLoading}
                  />


                  <View style={styles.lineViewContainer}>
                    <View style={styles.leftRightLine} />
                    <AppText style={styles.ortext}>{t('login.orText')}</AppText>
                    <View style={styles.leftRightLine} />
                  </View>

                  <Spacing space={SH(15)} />
                  <Image source={imagePaths.finger_print} style={styles.fingerPrintImage} />
                  <Spacing space={SH(15)} />
                  <View style={styles.socialIconContainer}>
                    {socialButtons.map((button, index) => (
                      <SocialButton
                        key={index}
                        icon={button.icon}
                        width={SF(40)}
                        iconSize={index == 2 ? SF(31) : SF(26)}
                        onPress={button.onPress}
                      />
                    ))}
                  </View>

                  <Spacing space={SH(10)} />

                  <AppText style={styles.dontHaveAccTxt}>
                    {t('login.dontHaveAccount')}
                    <AppText
                      onPress={() => {
                        navigation.navigate(RouteName.SIGNUP);
                      }}
                      style={{ fontFamily: Fonts.SEMI_BOLD, fontSize: SF(14) }}>
                      {t('login.signUp')}
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

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
  },
  errorText: {
    color: 'red',
    fontSize: SF(12),
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
    marginTop: SF(20)
  },
  leftRightLine: {
    height: 1,
    backgroundColor: Colors.white,
    width: SCREEN_WIDTH * 0.39,
  },
  ortext: {
    color: Colors.textWhite,
    fontFamily: Fonts.BOLD,
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
  fingerPrintImage: { height: SF(46), width: SF(46), resizeMode: "contain", alignSelf: "center" },
  dontHaveAccTxt: {
    color: Colors.textWhite,
    fontFamily: Fonts.REGULAR,
    fontSize: SF(14),
    textAlign: 'center',
  },
});
