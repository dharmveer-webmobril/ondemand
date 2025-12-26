import imagePaths from '@assets';
import { AuthBottomContainer, Container, CustomButton, CustomInput, CustomText, ImageComp } from '@components';
import { navigate } from '@utils/NavigationUtils';
import { useThemeContext } from '@utils/theme';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useResetPassword } from '@services/api/queries/authQueries';
import { showToast } from '@components/common/CustomToast';
import { useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SCREEN_NAMES } from '@navigation';

const UpdatePass = () => {
    const theme = useThemeContext();
    const { t } = useTranslation();
    const route = useRoute<any>();
    const [passwordVisibility, setPasswordVisibility] = useState(true);
    const [confirmPasswordVisibility, setConfirmPasswordVisibility] = useState(true);
    const { colors: Colors, fonts } = theme;
    const insets = useSafeAreaInsets();
    const statusBarHeight = insets.top;

    // Get email and OTP from route params (from OtpVerify)
    const email = route?.params?.email || '';
    const otp = route?.params?.otp || '';

    const resetPasswordMutation = useResetPassword();

    // Validation schema with translations
    const validationSchema = Yup.object().shape({
        newPassword: Yup.string()
            .min(8, t('validation.passValid'))
            .matches(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                t('validation.passValid')
            )
            .required(t('validation.emptyNewPassword')),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('newPassword')], t('validation.notMatchConfirmPassword'))
            .required(t('validation.emptyConfirmPassword')),
    });

    const formik = useFormik({
        initialValues: {
            newPassword: '',
            confirmPassword: '',
        },
        validationSchema,
        onSubmit: async (values) => {
            if (!email || !otp) {
                showToast({
                    type: 'error',
                    title: t('messages.error'),
                    message: t('updatepass.missingCredentials'),
                });
                navigate(SCREEN_NAMES.FORGOT_PASS);
                return;
            }

            try {
                const response = await resetPasswordMutation.mutateAsync({
                    email: email,
                    otp: otp,
                    newPassword: values.newPassword,
                });

                if (response.succeeded && response.ResponseCode === 200) {
                    showToast({
                        type: 'success',
                        title: t('messages.success'),
                        message: (response.ResponseMessage || t('messages.passwordUpdated')),
                    });

                    // Navigate to login after a short delay
                    setTimeout(() => {
                        navigate(SCREEN_NAMES.LOGIN);
                    }, 1500);
                } else {
                    showToast({
                        type: 'error',
                        title: t('messages.error'),
                        message: response.ResponseMessage || t('messages.passwordChangeFailed'),
                    });
                }
            } catch (error: any) {
                console.error('Reset password error:', error);
                showToast({
                    type: 'error',
                    title: t('messages.error'),
                    message: error?.response?.data?.ResponseMessage || t('messages.passwordChangeFailed'),
                });
            }
        },
    });

    const handleUpdatePassword = () => {
        // Mark all fields as touched to show validation errors
        formik.setTouched({
            newPassword: true,
            confirmPassword: true,
        });

        // Validate and submit
        formik.validateForm().then((errors) => {
            if (Object.keys(errors).length === 0) {
                formik.handleSubmit();
            } else {
                const firstErrorKey = Object.keys(errors)[0];
                const firstError = errors[firstErrorKey as keyof typeof errors];
                
                if (firstError) {
                    showToast({
                        type: 'error',
                        title: t('messages.error'),
                        message: firstError as string,
                    });
                }
            }
        });
    };

    return (
        <Container safeArea={false} statusBarColor={theme.colors.white} style={{ backgroundColor: theme.colors.white }}>
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
                    {t('updatepass.title')}
                </CustomText>
                <CustomText
                    variant="h5"
                    textAlign={'center'}
                    color={Colors.whitetext}
                    fontFamily={fonts.REGULAR}
                    marginTop={theme.margins.md}
                >
                    {t('updatepass.subtitle')}
                </CustomText>
                <CustomInput
                    leftIcon={imagePaths.lock_icon}
                    placeholder={t('placeholders.newPassword')}
                    errortext={formik.touched.newPassword && formik.errors.newPassword ? formik.errors.newPassword : ''}
                    inputTheme={'white'}
                    secureTextEntry={passwordVisibility}
                    value={formik.values.newPassword}
                    onChangeText={formik.handleChange('newPassword')}
                    onBlur={formik.handleBlur('newPassword')}
                    onRightIconPress={() => setPasswordVisibility(!passwordVisibility)}
                    rightIcon={!passwordVisibility ? imagePaths.eye_open : imagePaths.eye_off_icon}
                    marginTop={theme.SH(20)}
                />

                <CustomInput
                    leftIcon={imagePaths.lock_icon}
                    placeholder={t('placeholders.confirmPassword')}
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
                    rightIcon={!confirmPasswordVisibility ? imagePaths.eye_open : imagePaths.eye_off_icon}
                    onRightIconPress={() => setConfirmPasswordVisibility(!confirmPasswordVisibility)}
                    marginTop={theme.SH(20)}
                    keyboardType={'default'}
                />

                <CustomButton
                    title={t('updatepass.update')}
                    backgroundColor={theme.colors.white}
                    textColor={theme.colors.primary}
                    marginTop={theme.SH(150)}
                    onPress={handleUpdatePassword}
                    isLoading={resetPasswordMutation.isPending}
                    disable={resetPasswordMutation.isPending}
                />
            </AuthBottomContainer>
        </Container>
    );
};

export default UpdatePass;
