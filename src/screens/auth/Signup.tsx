import imagePaths from '@assets';
import { AuthBottomContainer, Container, CustomButton, CustomInput, CustomText, ImageComp, OrText, VectoreIcons, CountryModal, CountryCodeSelector, showToast } from '@components';
import { SCREEN_NAMES } from '@navigation';
import { SignupStyle } from '@styles/screens';
import { navigate } from '@utils/NavigationUtils';
import { useThemeContext } from '@utils/theme';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSignup } from '@services/api/queries/authQueries';
import { useGetCities, useGetCountries } from '@services/api/queries/appQueries';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

interface Country {
    _id: string;
    name: string;
    countryCode: string;
    phoneCode: string;
}

interface City {
    _id: string;
    name: string;
}

const Signup = () => {
    const theme = useThemeContext();
    const { t } = useTranslation();
    const styles = SignupStyle(theme);
    const [passwordVisibility, setPasswordVisibility] = useState(true);
    const [confirmPasswordVisibility, setConfirmPasswordVisibility] = useState(true);
    const [checked, setChecked] = useState(false);
    const [showCountryModal, setShowCountryModal] = useState(false);
    const [showCityModal, setShowCityModal] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
    const [selectedCity, setSelectedCity] = useState<City | null>(null);
    const insets = useSafeAreaInsets();
    const statusBarHeight = insets.top;

    const signupMutation = useSignup();

    const { data: countryData, isLoading: countryLoading } = useGetCountries();

    const countries = useMemo(() => {
        return countryData?.ResponseData || [];
    }, [countryData]);
    useEffect(() => {
        if (countries.length > 0) {
            setSelectedCountry(countries[0]);
        }
    }, [countries]);

    const { data: citiesData, isLoading: citiesLoading } = useGetCities(selectedCountry?._id || null);

    const cities = useMemo(() => {
        return citiesData?.ResponseData || [];
    }, [citiesData]);


    // Validation schema with translations
    const validationSchema = Yup.object().shape({
        name: Yup.string()
            .min(3, t('validation.fullNameMinLength'))
            .required(t('validation.emptyFullName')),
        email: Yup.string()
            .email(t('validation.validEmail'))
            .required(t('validation.emptyEmail')),
        contact: Yup.string()
            .min(10, t('validation.mobileMinLen'))
            .required(t('validation.emptyMobile')),
        password: Yup.string()
            .min(8, t('validation.passValid'))
            .matches(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                t('validation.passValid')
            )
            .required(t('validation.emptyPassword')),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('password')], t('validation.notMatchConfirmPassword'))
            .required(t('validation.emptyConfirmPassword')),
        country: Yup.string().required(t('validation.emptyCountry')),
        city: Yup.string().required(t('validation.emptyCity')),
        acceptTerms: Yup.boolean()
            .oneOf([true], t('messages.acceptTermCond'))
            .required(t('messages.acceptTermCond')),
    });

    const formik = useFormik({
        initialValues: {
            name: '',
            email: '',
            contact: '',
            password: '',
            confirmPassword: '',
            country: '',
            city: '',
            acceptTerms: false,
        },
        validationSchema,
        onSubmit: async (values, { setSubmitting }) => {
            console.log('Form submitted with values:', values);
            console.log('Selected country:', selectedCountry);
            console.log('Selected city:', selectedCity);

            // Double check country and city
            if (!selectedCountry || !selectedCity) {
                showToast({
                    type: 'error',
                    title: t('messages.error'),
                    message: t('signup.countryRequired') + '\n' + t('signup.selectCountryFirst'),
                });
                setSubmitting(false);
                return;
            }

            // Ensure formik values are set
            if (!values.country || !values.city) {
                formik.setFieldValue('country', selectedCountry._id);
                formik.setFieldValue('city', selectedCity._id);
            }

            try {
                const signupData = {
                    name: values.name,
                    email: values.email,
                    password: values.password,
                    contact: values.contact,
                    city: selectedCity._id,
                    country: selectedCountry._id,
                    coordinates: {
                        lat: 28.7041,
                        lng: 77.1025,
                    },
                };

                const response = await signupMutation.mutateAsync(signupData);

                if (response.succeeded && response.ResponseCode === 201) {
                    showToast({
                        type: 'success',
                        title: t('messages.success'),
                        message: t('messages.regSuccessMsg'),
                    });
                    navigate(SCREEN_NAMES.OTP_VERIFY, {
                        prevScreen: 'signup',
                        email: response.ResponseData.email,
                        customerId: response.ResponseData.customerId,
                        otp: response.ResponseData.otp,
                    });
                } else {
                    showToast({
                        type: 'error',
                        title: t('messages.error'),
                        message: response.ResponseMessage || t('messages.somethingWentWrong'),
                    });
                }
            } catch (error: any) {
                console.error('Signup error:', error);
                const errorMessage = error?.response?.data?.ResponseMessage || error?.message || t('messages.signupFailed');
                showToast({
                    type: 'error',
                    title: t('messages.error'),
                    message: errorMessage || (t('messages.signupFailed') || t('messages.somethingWentWrong')),
                });
            } finally {
                setSubmitting(false);
            }
        },
    });

    const handleCountrySelect = (country: Country) => {
        setSelectedCountry(country);
        // Reset city when country changes
        setSelectedCity(null);
        formik.setFieldValue('country', country._id, false);
        formik.setFieldValue('city', '', false);
        // formik.setFieldTouched('country', true, false);
        formik.setFieldTouched('city', false, false);
        formik.validateField('country');
    };

    const handleCitySelect = (city: City) => {
        setSelectedCity(city);
        formik.setFieldValue('city', city._id, false);
        // formik.setFieldTouched('city', true, false);
        formik.validateField('city');
    };

    const handleFormSubmit = () => {
        if (selectedCountry && !formik.values.country) {
            formik.setFieldValue('country', selectedCountry._id);
        }
        if (selectedCity && !formik.values.city) {
            formik.setFieldValue('city', selectedCity._id);
        }
        formik.setTouched({
            name: true,
            email: true,
            contact: true,
            password: true,
            confirmPassword: true,
            country: true,
            city: true,
            acceptTerms: true,
        });

        formik.validateForm().then((errors) => {
            if (Object.keys(errors).length === 0) {
                formik.handleSubmit();
            } else {
                console.log('Validation errors:', errors);
            }
        });
    };


    return (
        <Container safeArea={false} statusBarColor={theme.colors.white} style={{ backgroundColor: theme.colors.white }}>

            <KeyboardAwareScrollView
                contentContainerStyle={styles.contentContainer}
                enableOnAndroid={true}
                extraScrollHeight={100}
                keyboardShouldPersistTaps="handled"
                enableResetScrollToCoords={false}
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
                <AuthBottomContainer style={{ paddingVertical: theme.SH(40), paddingHorizontal: theme.SW(25) }}>
                    <CustomInput
                        leftIcon={imagePaths.email_icon}
                        placeholder={t('placeholders.fullname')}
                        errortext={formik.touched.name && formik.errors.name ? formik.errors.name : ''}
                        inputTheme={'white'}
                        value={formik.values.name}
                        onChangeText={formik.handleChange('name')}
                        onBlur={formik.handleBlur('name')}
                    />

                    {/* Contact with Country Code */}
                    <View style={styles.contactContainer}>
                        <Pressable
                            style={styles.countryCodeContainer}
                            onPress={() => setShowCountryModal(true)}
                        >
                            <CountryCodeSelector
                                countryCode={selectedCountry?.phoneCode || '+91'}
                                onPress={() => setShowCountryModal(true)}
                            />
                        </Pressable>
                        <View style={styles.phoneInputContainer}>
                            <CustomInput
                                leftIcon={imagePaths.mobile_icon}
                                placeholder={t('placeholders.mobileno')}
                                // errortext={formik.touched.contact && formik.errors.contact ? formik.errors.contact : ''}
                                inputTheme={'white'}
                                value={formik.values.contact}
                                onChangeText={formik.handleChange('contact')}
                                onBlur={formik.handleBlur('contact')}
                                keyboardType='number-pad'
                            />
                        </View>
                    </View>

                    {/* Show country validation error if country not selected */}
                    {formik.touched.contact && formik.errors.contact && (
                        <View style={{ marginTop: theme.SH(5), marginLeft: theme.SW(5) }}>
                            <CustomText
                                fontSize={theme.fontSize.xxs}
                                color={theme.colors.errorText || '#FF0000'}
                            >
                                {formik.errors.contact}
                            </CustomText>
                        </View>
                    )}
                    {/* {formik.touched.country && formik.errors.country && (
                    <View style={{ marginTop: theme.SH(5), marginLeft: theme.SW(5) }}>
                        <CustomText
                            fontSize={theme.fontSize.xxs}
                            color={theme.colors.errorText || '#FF0000'}
                        >
                            {formik.errors.country}
                        </CustomText>
                    </View>
                )} */}

                    <CustomInput
                        leftIcon={imagePaths.email_icon}
                        placeholder={t('placeholders.email')}
                        errortext={formik.touched.email && formik.errors.email ? formik.errors.email : ''}
                        inputTheme={'white'}
                        value={formik.values.email}
                        onChangeText={formik.handleChange('email')}
                        onBlur={formik.handleBlur('email')}
                        marginTop={theme.SH(15)}
                        keyboardType='email-address'
                        autoCapitalize='none'
                    />

                    {/* City Selection */}
                    <Pressable
                        onPress={() => {
                            if (selectedCountry) {
                                setShowCityModal(true);
                            } else {
                                showToast({
                                    type: 'error',
                                    title: t('messages.error'),
                                    message: t('signup.selectCountryFirst') + '\n' + t('signup.selectCountry'),
                                });
                            }
                        }}
                        disabled={!selectedCountry}
                    >
                        <CustomInput
                            leftIcon={imagePaths.map_img}
                            placeholder={t('placeholders.selectCity')}
                            errortext={formik.touched.city && formik.errors.city ? formik.errors.city : ''}
                            inputTheme={'white'}
                            value={selectedCity?.name || ''}
                            editable={false}
                            isEditable={false}
                            marginTop={theme.SH(15)}
                            rightIcon={imagePaths.right_icon}
                        />
                    </Pressable>

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
                        rightIcon={!confirmPasswordVisibility ? imagePaths.eye_open : imagePaths.eye_off_icon}
                        onRightIconPress={() => setConfirmPasswordVisibility(!confirmPasswordVisibility)}
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
                                {' '}
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
                        isLoading={signupMutation.isPending || formik.isSubmitting}
                        disable={signupMutation.isPending || formik.isSubmitting}
                    />

                    <OrText />

                    <View style={{ alignItems: 'center', marginTop: theme.SH(20) }}>
                        <CustomText fontSize={theme.fontSize.sm} color={theme.colors.whitetext}>
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

            </KeyboardAwareScrollView>
            {/* Country Modal */}
            <CountryModal
                type='country'
                data={countries || []}
                visible={showCountryModal}
                onClose={() => setShowCountryModal(false)}
                onSelect={handleCountrySelect}
                selectedId={selectedCountry?._id || null}
                isLoading={countryLoading}
            />

            {/* City Modal */}
            <CountryModal
                type='city'
                data={cities || []}
                visible={showCityModal}
                onClose={() => setShowCityModal(false)}
                onSelect={handleCitySelect}
                selectedId={selectedCity?._id || null}
                isLoading={citiesLoading}
            />

        </Container>
    );
};

export default Signup;
