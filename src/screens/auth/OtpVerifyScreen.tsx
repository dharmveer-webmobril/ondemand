import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, StyleSheet, View } from 'react-native';
import { Colors, Fonts, handleApiError, handleApiFailureResponse, handleSuccessToast, SF, SH, SW, useCountdown, useProfileUpdate } from '../../utils';
import { AppText, AuthBackButton, AuthBottomContainer, AuthImgComp, Container, showAppToast, Spacing } from '../../component';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import imagePaths from '../../assets/images';
import Buttons from '../../component/Button';
import RouteName from '../../navigation/RouteName';
import OTPTextView from 'react-native-otp-textinput';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { setToken, useResendOtpMutation, useVerifyOtpMutation } from '../../redux';
import { useDispatch } from 'react-redux';

type OtpVerifyScreenProps = {};

const OtpVerifyScreen: React.FC<OtpVerifyScreenProps> = () => {
  const input = useRef<any>(null);
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const route = useRoute<any>();
  let fromScreen = route?.params?.fromScreen;

  const [otp, setOtp] = useState<string | number>('');
  const [userToken, setUserToken] = useState<string>(route?.params?.userToken);
  const [dummyOtp, setDummyOtp] = useState<string>(route?.params?.otp);

  const [resendOtp, { isLoading: otpLoader }] = useResendOtpMutation();
  const [verifyOtp, { isLoading: otpVerifyLoader }] = useVerifyOtpMutation();
  const dispatch = useDispatch();

  const { time, startCountdown, resetCountdown, status, formatTime } = useCountdown();

  useEffect(() => {
    startCountdown(60);
  }, [startCountdown]);

  useProfileUpdate();


  const btnResendOtp = async () => {
    console.log('userToken:', userToken);

    try {
      const response = await resendOtp(userToken).unwrap();
      console.log('resendOtp Response:', response);

      if (response?.success) {
        handleSuccessToast(response.message || t('messages.otpResendSucccess'));

        const accessToken = typeof response.data?.accessToken === 'string'
          ? response.data.accessToken
          : response.data?.accessToken?.accessToken;

        if (accessToken) {
          setUserToken(accessToken);
          setDummyOtp(response.data.otp)
        }
        resetCountdown();
        startCountdown(60);
      } else {
        handleApiFailureResponse(response, t('messages.otpResendFailed'));
      }
    } catch (error: any) {
      handleApiError(error);
    }
  };

  const btnVerifyOtp = async () => {
    if (!otp) {
      showAppToast({
        title: t('messages.error'),
        message: t('validation.emotyOtp'),
        type: 'error',
        timeout: 3000,
      });
      return;
    }

    const userData = { otp };

    try {
      const response = await verifyOtp({ otpData: userData, token: userToken }).unwrap();
      console.log('Verify OTP Response:', response);

      if (response.success) {
        // handleSuccessToast(response.message || 'OTP verified successfully');

        const token = response?.data?.accessToken?.accessToken || response?.data?.accessToken;

        if (fromScreen === 'signup') {
          dispatch(setToken({ token }));
          navigation.navigate(RouteName.HOME);
        }

        if (fromScreen === 'forgotpass') {
          navigation.navigate(RouteName.PASS_UPDATE, { userToken: response.ResponseBody?.token || token });
        }

        resetCountdown();

      } else {
        handleApiFailureResponse(response, t('messages.invailidOtp'));
      }

    } catch (error: any) {
      handleApiError(error);
    }
  };





  return (
    <Container
      isAuth={true}
      isBackButton={true}
      onBackPress={() => {
        navigation.goBack();
      }}
      style={styles.container}>
      <AuthBackButton />
      <KeyboardAwareScrollView
        bounces={false}
        contentContainerStyle={styles.scropllViewContainer}
        showsVerticalScrollIndicator={false}
        extraScrollHeight={SH(40)}>
        <Spacing space={SH(40)} />
        <AuthImgComp icon={imagePaths.otp_verify_img} />
        <AuthBottomContainer>
          <View style={styles.bottomInnerContainer}>
            <View>
              <AppText style={styles.heading}> {t('otpverify.title')}</AppText>
              <AppText style={styles.subtitile}>{t('otpverify.subtitle')}</AppText>

              <OTPTextView
                ref={input}
                textInputStyle={styles.textInputContainer}
                handleTextChange={val => {
                  setOtp(val);
                }}
                inputCount={4}
                keyboardType="numeric"
                tintColor={Colors.white}
                autoFocus
              />

              <View
                style={styles.resteTextCont}>
                {otpLoader ? (
                  <ActivityIndicator color={'#ffffff'} style={styles.activeIndigator} />
                ) : (
                  <AppText
                    onPress={() => {
                      status !== 'running' && btnResendOtp();
                    }}
                    style={styles.resteText}>
                    {status === 'running' ? formatTime(time) : t('otpverify.resendOTP')}
                  </AppText>
                )}
              </View>
            </View>
            {dummyOtp && <AppText style={styles.otpText}>OTP : {dummyOtp}</AppText>}
            <Buttons
              buttonStyle={styles.burronContainer}
              textColor={Colors.themeColor}
              title={t('otpverify.verify')}
              onPress={() => {
                btnVerifyOtp();
                Keyboard.dismiss();
              }}
              isLoading={otpVerifyLoader}
            />
          </View>
        </AuthBottomContainer>
      </KeyboardAwareScrollView>
    </Container>
  );
};

export default OtpVerifyScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bgwhite,
  },
  scropllViewContainer: {
    flexGrow: 1,
    paddingHorizontal: 0,
  },
  subtitile: {
    color: Colors.textWhite,
    fontFamily: Fonts.REGULAR,
    fontSize: SF(14),
    textAlign: 'center',
    marginTop: SH(20),
    marginBottom: SH(30),
    lineHeight: SH(22),
  },
  heading: {
    color: Colors.textWhite,
    fontFamily: Fonts.BOLD,
    fontSize: SF(20),
    textAlign: 'center',
  },
  burronContainer: { backgroundColor: Colors.bgwhite, marginTop: SH(160), width: '94%', alignSelf: 'center' },
  bottomInnerContainer: {
    paddingVertical: SH(35),
    paddingHorizontal: SW(20),
    height: '100%',
  },
  textInputContainer: {
    height: SH(45),
    width: SW(65),
    borderWidth: 1,
    borderRadius: SW(10),
    borderBottomWidth: 1.2,
    fontSize: 14,
    color: Colors.white,
    backgroundColor: 'transparent',
  },
  resteTextCont: {
    paddingRight: 7,
    alignItems: 'flex-end',
  },
  resteText: {
    fontFamily: Fonts.REGULAR,
    fontSize: SF(14),
    textAlign: 'right',
    marginTop: 8,
    color: Colors.textWhite
  },
  otpText: {
    fontFamily: Fonts.REGULAR,
    fontSize: SF(14),
    textAlign: 'center',
    marginTop: 8,
    color: Colors.textWhite
  },
  activeIndigator: { marginTop: 8 },
});
