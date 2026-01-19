import imagePaths from '@assets';
import { AuthBottomContainer, Container, CustomButton, CustomInput, CustomText, ImageComp, OrText, showToast, SocialButtons } from '@components';
import { LoginStyle } from '@styles/screens';
import { SF } from '@utils/dimensions';
import { navigate } from '@utils/NavigationUtils';
import { useThemeContext } from '@utils/theme';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch } from '@store/hooks';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { setCityId, setCountryId, setCredentials } from '@store/slices/authSlice';
import { useLogin } from '@services';
import { SCREEN_NAMES } from '@navigation';
import { useDisableGestures } from '@utils/hooks';

export const socialButtons = [
    {
        icon: imagePaths.google_icon,
        onPress: () => { },
    },
    {
        icon: imagePaths.fb_icon,
        onPress: () => { },
    },
    {
        icon: imagePaths.insta_icon,
        onPress: () => { },
    },
];

const Login = () => {
    const theme = useThemeContext();
    const { t } = useTranslation();
    const styles = LoginStyle(theme);
    const dispatch = useAppDispatch();
    useDisableGestures();
    const [passwordVisibility, setPasswordVisibility] = useState(true);
    const insets = useSafeAreaInsets();
    const statusBarHeight = insets.top;

    const loginMutation = useLogin();

    // Validation schema with translations
    const validationSchema = Yup.object().shape({
        email: Yup.string()
            .email(t('validation.validEmail'))
            .required(t('validation.emptyEmail')),
        password: Yup.string()
            .required(t('validation.emptyPassword')),
    });

    const formik = useFormik({
        initialValues: {
            email: 'test@mailinator.com',
            password: 'Qwerty@1',
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                const response = await loginMutation.mutateAsync({
                    email: values.email,
                    password: values.password,
                });


                const { token, customer, otp = '', note = '' } = response.ResponseData;
                if (response.succeeded && response.ResponseCode === 200) {
                    // Store credentials in Redux
                    dispatch(
                        setCredentials({
                            userId: customer._id,
                            token: token,
                            userDetails: customer,
                        })
                    );
                    dispatch(setCityId(customer.city));
                    dispatch(setCountryId(customer.country));
                    showToast({
                        type: 'success',
                        title: t('messages.success'),
                        message: t('login.loginSuccess'),
                    });

                    if (customer?.interests && customer?.interests?.length > 0) {
                        setTimeout(() => {
                            navigate(SCREEN_NAMES.HOME);
                        }, 1000);
                    } else {
                        navigate(SCREEN_NAMES.INTEREST_CHOOSE, { prevScreen: 'auth' });
                    }
                    
                } else if (!response.succeeded && response.ResponseCode === 200 && otp && note) {
                    showToast({
                        type: 'error',
                        title: t('messages.error'),
                        message: note,
                    });
                    navigate(SCREEN_NAMES.OTP_VERIFY, {
                        prevScreen: 'signup',
                        email: values.email,
                        otp: otp,
                        note: note,
                    });
                } else {
                    showToast({
                        type: 'error',
                        title: t('messages.error'),
                        message: response.ResponseMessage || t('messages.loginFailed'),
                    });
                }
            } catch (error: any) {
                console.error('Login error:', error);
                const message = error?.response?.data?.ResponseMessage || t('messages.loginFailed')
                showToast({
                    type: 'error',
                    title: t('messages.error'),
                    message: message,
                });
            }
        },
    });

    const handleLogin = () => {
        formik.setTouched({
            email: true,
            password: true,
        });

        formik.validateForm().then((errors) => {
            if (Object.keys(errors).length === 0) {
                formik.handleSubmit();
            } else {
                console.log('errors', errors);
            }
        });
    };

    return (
        <Container safeArea={false} statusBarColor={theme.colors.white} style={{ backgroundColor: theme.colors.white }}>
            <KeyboardAwareScrollView
                contentContainerStyle={styles.scrollViewContainer}
                showsVerticalScrollIndicator={false}
                extraScrollHeight={theme.SH(40)}>
                <ImageComp
                    imageSource={imagePaths.login_img}
                    marginLeft={'auto'}
                    marginRight={'auto'}
                    marginBottom={20}
                    height={theme.SH(225)}
                    width={theme.SW(225)}
                    marginTop={10 + statusBarHeight}
                />
                <AuthBottomContainer style={{ paddingVertical: theme.SH(40), paddingHorizontal: theme.SW(25) }}>
                    <CustomInput
                        leftIcon={imagePaths.email_icon}
                        placeholder={t('placeholders.email')}
                        errortext={formik.touched.email && formik.errors.email ? formik.errors.email : ''}
                        inputTheme={'white'}
                        value={formik.values.email}
                        onChangeText={formik.handleChange('email')}
                        onBlur={formik.handleBlur('email')}
                        keyboardType='email-address'
                        autoCapitalize='none'
                    />
                    <CustomInput
                        leftIcon={imagePaths.lock_icon}
                        placeholder={t('placeholders.password')}
                        errortext={formik.touched.password && formik.errors.password ? formik.errors.password : ''}
                        inputTheme={'white'}
                        secureTextEntry={passwordVisibility}
                        value={formik.values.password}
                        onChangeText={formik.handleChange('password')}
                        onBlur={formik.handleBlur('password')}
                        onRightIconPress={() => setPasswordVisibility(!passwordVisibility)}
                        rightIcon={!passwordVisibility ? imagePaths.eye_open : imagePaths.eye_off_icon}
                        marginTop={theme.SH(25)}
                    />

                    <CustomText
                        onPress={() => {
                            navigate(SCREEN_NAMES.FORGOT_PASS);
                        }}
                        color={theme.colors.whitetext}
                        variant="h5"
                        style={styles.forgotPassTxt}
                    >
                        {t('login.forgotPassword')}
                    </CustomText>
                    <CustomButton
                        title={t('login.loginButton')}
                        backgroundColor={theme.colors.white}
                        textColor={theme.colors.primary}
                        marginTop={theme.SH(40)}
                        onPress={handleLogin}
                        isLoading={loginMutation.isPending}
                        disable={loginMutation.isPending}
                    />

                    <OrText />

                    <View style={styles.socialIconContainer}>
                        {socialButtons.map((button, index) => (
                            <SocialButtons
                                key={index}
                                icon={button.icon}
                                width={SF(40)}
                                iconSize={index === 2 ? SF(31) : SF(26)}
                                onPress={() => {
                                    // btnSignup()
                                }}
                            />
                        ))}
                    </View>
                    <View style={styles.signupTextContainer}>
                        <CustomText fontSize={theme.fontSize.sm} color={theme.colors.whitetext}>
                            {t('login.dontHaveAccount')}{' '}
                            <CustomText
                                onPress={() => {
                                    navigate(SCREEN_NAMES.SIGNUP);
                                }}
                                fontSize={theme.fontSize.md}
                                fontFamily={theme.fonts.SEMI_BOLD}
                                color={theme.colors.whitetext}
                            >
                                {t('login.signUp')}
                            </CustomText>
                        </CustomText>
                    </View>
                </AuthBottomContainer>
            </KeyboardAwareScrollView>
        </Container>
    );
};

export default Login;
