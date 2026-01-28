import imagePaths from '@assets';
import { AuthBottomContainer, Container, CustomButton, CustomInput, CustomText, ImageComp } from '@components';
import { navigate } from '@utils/NavigationUtils';
import { useThemeContext } from '@utils/theme';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useForgotPassword } from '@services/api/queries/authQueries';
import { showToast } from '@components/common/CustomToast';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SCREEN_NAMES } from '@navigation';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const ForgotPass = () => {
    const theme = useThemeContext();
    const { t } = useTranslation();
    const { colors: Colors, SH, fonts } = theme;
    const insets = useSafeAreaInsets();
    const statusBarHeight = insets.top;

    const forgotPasswordMutation = useForgotPassword();

    // Validation schema with translations
    const validationSchema = Yup.object().shape({
        email: Yup.string()
            .email(t('validation.validEmail'))
            .required(t('validation.emptyEmail')),
    });

    const formik = useFormik({
        initialValues: {
            email: '',
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                const response = await forgotPasswordMutation.mutateAsync({
                    email: values.email,
                });
                console.log('response', response);

                if (response.succeeded && response.ResponseCode === 200) {
                    showToast({
                        type: 'success',
                        title: t('messages.success'),
                        message: (response.ResponseMessage || t('forgotpass.otpSentMessage')) + '\n' + t('otpverify.checkEmail'),
                    });

                    // Navigate to OTP verification
                    navigate(SCREEN_NAMES.OTP_VERIFY, {
                        prevScreen: 'forgotpass',
                        email: values.email,
                        otp: response.ResponseData?.otp,
                    });
                } else {
                    showToast({
                        type: 'error',
                        title: t('messages.error'),
                        message: response.ResponseMessage || (t('forgotpass.failedToSendOtp') + '\n' + t('messages.somethingWentWrong')),
                    });
                }
            } catch (error: any) {
                console.error('Forgot password error:', error);
                showToast({
                    type: 'error',
                    title: t('messages.error'),
                    message: error?.response?.data?.ResponseMessage || (t('forgotpass.failedToSendOtp') + '\n' + t('messages.somethingWentWrong')),
                });
            }
        },
    });

    const handleSendOtp = () => {
        // Mark field as touched to show validation errors
        formik.setTouched({
            email: true,
        });

        // Validate and submit
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
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1 }}
                enableOnAndroid={false}
                extraScrollHeight={theme.SH(40)}
                keyboardShouldPersistTaps="handled"
                enableResetScrollToCoords={false}
            >

                <ImageComp
                    imageSource={imagePaths.forgot_img}
                    marginLeft={'auto'}
                    marginRight={'auto'}
                    marginBottom={20}
                    height={theme.SH(225)}
                    width={theme.SW(225)}
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
                        {t('forgotpass.forgotPassword')}
                    </CustomText>
                    <CustomText
                        variant="h5"
                        textAlign={'center'}
                        color={Colors.whitetext}
                        fontFamily={fonts.REGULAR}
                        marginTop={theme.margins.md}
                    >
                        {t('forgotpass.subtitle')}
                    </CustomText>
                    <CustomInput
                        leftIcon={imagePaths.email_icon}
                        placeholder={t('placeholders.email')}
                        errortext={formik.touched.email && formik.errors.email ? formik.errors.email : ''}
                        inputTheme={'white'}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={formik.values.email}
                        onChangeText={formik.handleChange('email')}
                        onBlur={formik.handleBlur('email')}
                        marginTop={SH(40)}
                    />

                    <CustomButton
                        title={t('forgotpass.sendotp')}
                        backgroundColor={theme.colors.white}
                        textColor={theme.colors.primary}
                        marginTop={theme.SH(150)}
                        onPress={handleSendOtp}
                        isLoading={forgotPasswordMutation.isPending}
                        disable={forgotPasswordMutation.isPending}
                    />
                </AuthBottomContainer>
            </KeyboardAwareScrollView>
        </Container>
    );
};

export default ForgotPass;
