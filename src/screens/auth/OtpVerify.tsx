import imagePaths from '@assets';
import { AuthBottomContainer, Container, CustomButton, CustomText, ImageComp } from '@components';
import { useRoute } from '@react-navigation/native';
import { SF } from '@utils/dimensions';
import { useCountdown } from '@utils/hooks';
import { navigate } from '@utils/NavigationUtils';
import { useThemeContext } from '@utils/theme';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import OTPTextView from 'react-native-otp-textinput';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useVerifyOtp, useResendOtp } from '@services/api/queries/authQueries';
import { useAppDispatch } from '@store/hooks';
import { setCityId, setCountryId, setCredentials } from '@store/slices/authSlice';
import { showToast } from '@components/common/CustomToast';
import { SCREEN_NAMES } from '@navigation';
import { setUserCity } from '@store/slices/appSlice';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const OtpVerify = () => {
    const theme = useThemeContext();
    const { t } = useTranslation();
    const route = useRoute<any>();
    const dispatch = useAppDispatch();
    const input = useRef<any>(null);
    const [otp, setOtp] = useState<string>('');
    const { SW, colors: Colors, SH, fonts } = theme;
    const styles = useMemo(() => createStyles(SH, SW, Colors, fonts, theme), [SH, SW, Colors, fonts, theme]);
    const { time, startCountdown, resetCountdown, status, formatTime } = useCountdown();

    // Get route params
    const prevScreen = route?.params?.prevScreen;
    const email = route?.params?.email || '';
    const initialOtp = route?.params?.otp || '';

    const verifyOtpMutation = useVerifyOtp();
    const resendOtpMutation = useResendOtp();

    useEffect(() => {
        startCountdown(60);
    }, [startCountdown]);

    // Auto-fill OTP if provided (for testing/development)
    useEffect(() => {
        if (initialOtp && input.current) {
            setOtp(initialOtp);
            input.current.setValue(initialOtp);
        }
    }, [initialOtp]);

    const insets = useSafeAreaInsets();
    const statusBarHeight = insets.top;

    const handleVerifyOtp = async () => {
        if (!otp || otp.length !== 4) {
            showToast({
                type: 'error',
                title: t('messages.error'),
                message: t('otpverify.enterValidOtp'),
            });
            return;
        }

        if (!email) {
            showToast({
                type: 'error',
                title: t('messages.error'),
                message: t('messages.somethingWentWrong'),
            });
            return;
        }

        try {
            const response = await verifyOtpMutation.mutateAsync({
                email: email,
                otp: otp,
                otpType: prevScreen === 'signup' ? 'signup' : 'forgot_password',
            });
            console.log('response------', JSON.stringify(response, null, 2));
            if (response.succeeded && response.ResponseCode === 200) {
                // If coming from signup, store credentials in Redux
                if (prevScreen === 'signup' && response.ResponseData) {
                    const { token, customer } = response.ResponseData;
                    dispatch(
                        setCredentials({
                            userId: customer._id,
                            token: token,
                            userDetails: customer,
                        })
                    );
                    dispatch(setCityId(customer.city));
                    dispatch(setCountryId(customer.country));
                    dispatch(setUserCity(customer.city));
                    showToast({
                        type: 'success',
                        title: t('messages.success'),
                        message: t('otpverify.otpVerifiedSuccess'),
                    });

                    // Navigate to interest choose or home
                    setTimeout(() => {
                        navigate(SCREEN_NAMES.INTEREST_CHOOSE, { prevScreen: 'auth' });
                    }, 1000);

                } else {
                    // Coming from forgot password
                    showToast({
                        type: 'success',
                        title: t('messages.success'),
                        message: t('otpverify.otpVerifiedSuccess'),
                    });

                    // Navigate to update password with email and OTP
                    setTimeout(() => {
                        navigate(SCREEN_NAMES.UPDATE_PASS, { email, otp });
                    }, 1000);
                }
            } else {
                showToast({
                    type: 'error',
                    title: t('messages.error'),
                    message: response.ResponseMessage || t('messages.invailidOtp'),
                });
            }
        } catch (error: any) {
            console.error('OTP verification error:', error);
            showToast({
                type: 'error',
                title: t('messages.error'),
                message: error?.response?.data?.ResponseMessage || t('messages.invailidOtp'),
            });
        }
    };

    const handleResendOtp = async () => {
        if (status === 'running') {
            return;
        }

        if (!email) {
            showToast({
                type: 'error',
                title: t('messages.error'),
                message: t('messages.somethingWentWrong'),
            });
            return;
        }

        try {
            const response = await resendOtpMutation.mutateAsync({ email });

            if (response.succeeded && response.ResponseCode === 200) {
                showToast({
                    type: 'success',
                    title: t('messages.success'),
                    message: t('messages.otpResendSucccess'),
                });

                // Reset countdown and start again
                resetCountdown();
                startCountdown(60);

                // Clear OTP input
                const newOtp = response.ResponseData?.otp || '';
                if (newOtp && input.current) {
                    setOtp(newOtp);
                    input.current.setValue(newOtp);
                } else {
                    // Clear OTP input if no OTP in response
                    setOtp('');
                    if (input.current) {
                        input.current.clear();
                    }
                }
            } else {
                showToast({
                    type: 'error',
                    title: t('messages.error'),
                    message: response.ResponseMessage || t('messages.otpResendFailed'),
                });
            }
        } catch (error: any) {
            console.error('Resend OTP error:', error);
            showToast({
                type: 'error',
                title: t('messages.error'),
                message: error?.response?.data?.ResponseMessage || t('messages.otpResendFailed'),
            });
        }
    };

    return (
        <Container safeArea={false} statusBarColor={theme.colors.white} style={{ backgroundColor: theme.colors.white }}>
            <KeyboardAwareScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1 }}
                enableOnAndroid={false}
                extraScrollHeight={100}
                keyboardShouldPersistTaps="handled"
                enableResetScrollToCoords={false}
            >
                <ImageComp
                    imageSource={imagePaths.otp_verify_img}
                    marginLeft={'auto'}
                    marginRight={'auto'}
                    marginBottom={20}
                    height={theme.SH(233)}
                    width={theme.SW(233)}
                    marginTop={10 + statusBarHeight}
                />
                <AuthBottomContainer style={{ paddingVertical: theme.SH(40), paddingHorizontal: theme.SW(25) }}>
                    <CustomText
                        variant="h3"
                        textAlign={'center'}
                        color={Colors.whitetext}
                        fontFamily={fonts.SEMI_BOLD}
                        marginTop={theme.margins.lg}
                    >
                        {t('otpverify.title')}
                    </CustomText>
                    <CustomText
                        variant="h5"
                        textAlign={'center'}
                        color={Colors.whitetext}
                        fontFamily={fonts.REGULAR}
                        marginTop={theme.margins.md}
                    >
                        {t('otpverify.subtitle')}
                    </CustomText>

                    <OTPTextView
                        ref={input}
                        textInputStyle={styles.textInputContainer}
                        handleTextChange={(val) => {
                            setOtp(val);
                        }}
                        inputCount={4}
                        keyboardType="numeric"
                        tintColor={theme.colors.white}
                        autoFocus
                    />
                    <View style={styles.resteTextCont}>
                        <CustomText
                            color={'#ffffff'}
                            textAlign={'right'}
                            onPress={handleResendOtp}
                            style={styles.resteText}
                        >
                            {status === 'running' ? formatTime(time) : t('otpverify.resendOTP')}
                        </CustomText>
                    </View>
                    <CustomButton
                        title={t('otpverify.verify')}
                        backgroundColor={theme.colors.white}
                        textColor={theme.colors.primary}
                        marginTop={theme.SH(200)}
                        onPress={handleVerifyOtp}
                        isLoading={verifyOtpMutation.isPending}
                        disable={verifyOtpMutation.isPending || otp.length !== 4}
                    />
                </AuthBottomContainer>
            </KeyboardAwareScrollView>
        </Container>
    );
};

export default OtpVerify;

const createStyles = (SH: any, SW: any, Colors: any, fonts: any, theme: any) =>
    StyleSheet.create({
        textInputContainer: {
            height: SH(45),
            width: SW(65),
            borderWidth: 1,
            borderRadius: SW(10),
            borderBottomWidth: 1.2,
            fontSize: 14,
            color: Colors.white,
            backgroundColor: 'transparent',
            marginTop: theme.margins.xl,
        },
        resteTextCont: {
            paddingRight: 7,
            alignItems: 'flex-end',
        },
        resteText: {
            fontFamily: fonts.REGULAR,
            fontSize: SF(14),
            textAlign: 'right',
            marginTop: 8,
            color: Colors.whitetext,
        },
        otpText: {
            fontFamily: fonts.REGULAR,
            fontSize: SF(14),
            textAlign: 'center',
            marginTop: 8,
            color: Colors.whitetext,
        },
        activeIndigator: { marginTop: 8 },
    });
