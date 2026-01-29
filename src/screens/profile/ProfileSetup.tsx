import { useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Container, AppHeader, CustomInput, CustomButton, CustomText, ImageLoader, VectoreIcons, CountryCodeSelector, CountryModal, showToast, ImagePickerModal } from '@components';
import { ThemeType, useThemeContext } from '@utils/theme';
import { useNavigation } from '@react-navigation/native';
import imagePaths from '@assets';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useGetCities, useGetCountries, useUpdateProfile, useUploadDocument } from '@services/index';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { updateUserDetails } from '@store/slices/authSlice';
import regex from '@utils/regexList';
import { setUserCity } from '@store/slices/appSlice';


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
export default function ProfileSetup() {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const userDetails = useAppSelector((state) => state.auth.userDetails);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [profileImage, setProfileImage] = useState('');
  const [showImagePicker, setShowImagePicker] = useState(false);

  const [showCityModal, setShowCityModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const { data: countryData, isLoading: countryLoading } = useGetCountries();

  const countries = useMemo(() => {
    return countryData?.ResponseData || [];
  }, [countryData]);

  const [hasInitializedFromUserData, setHasInitializedFromUserData] = useState(false);
  console.log('userDetails--------ProfileSetup', userDetails);
  const { data: citiesData, isLoading: citiesLoading } = useGetCities(selectedCountry?._id || null);

  const cities = useMemo(() => {
    return citiesData?.ResponseData || [];
  }, [citiesData]);

  // Set default country only if no userData exists
  useEffect(() => {
    if (countries.length > 0 && !hasInitializedFromUserData && !userDetails) {
      setSelectedCountry(countries[0]);
    }
  }, [countries, hasInitializedFromUserData, userDetails]);

  // Initialize from userData (only once)
  useEffect(() => {
    if (userDetails && !hasInitializedFromUserData && countries.length > 0) {
      const userCountryId = userDetails?.country?._id || userDetails?.country;
      const userCityId = userDetails?.city?._id || userDetails?.city;

      formik.setValues({
        name: userDetails?.name || '',
        email: userDetails?.email || '',
        contact: userDetails?.contact || '',
        city: userCityId || '',
        country: userCountryId || '',
      });

      // Set country from userData
      if (userCountryId) {
        const foundCountry = countries.find((c: Country) => c._id === userCountryId);
        if (foundCountry) {
          setSelectedCountry(foundCountry);
        }
      } else if (countries.length > 0) {
        setSelectedCountry(countries[0]);
      }

      setProfileImage(userDetails?.profileImage || '');
      setHasInitializedFromUserData(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userDetails, countries, hasInitializedFromUserData]);

  // Set city after cities are loaded (only if we have initialized from userData)
  useEffect(() => {
    if (hasInitializedFromUserData && cities.length > 0 && userDetails) {
      const userCityId = userDetails?.city?._id || userDetails?.city;
      if (userCityId) {
        const foundCity = cities.find((c: City) => c._id === userCityId);
        if (foundCity) {
          setSelectedCity(foundCity);
        }
      }
    }
  }, [cities, hasInitializedFromUserData, userDetails]);

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .min(3, t('validation.fullNameMinLength'))
      .matches(regex.NAME_REGEX, t('validation.validFullName'))
      .required(t('validation.emptyFullName')),
    email: Yup.string()
      .email(t('validation.validEmail'))
      .required(t('validation.emptyEmail')),
    contact: Yup.string()
      .matches(regex.MOBILE, t('validation.validMobile'))
      .required(t('validation.emptyMobile')),

    country: Yup.string().required(t('validation.emptyCountry')),
    city: Yup.string().required(t('validation.emptyCity')),
  });

  const updateProfileMutation = useUpdateProfile();
  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      contact: '',
      city: '',
      country: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        // Ensure country is set
        const countryId = selectedCountry?._id || values.country;
        if (!countryId) {
          showToast({
            type: 'error',
            title: t('messages.error') || 'Error',
            message: t('validation.emptyCountry') || 'Country is required',
          });
          return;
        }

        // Ensure city is set
        const cityId = selectedCity?._id || values.city;
        if (!cityId) {
          showToast({
            type: 'error',
            title: t('messages.error') || 'Error',
            message: t('validation.emptyCity') || 'City is required',
          });
          return;
        }

        const data = {
          name: values.name,
          email: values.email,
          contact: values.contact,
          city: cityId,
          country: countryId,
          profileImage: profileImage,
        };

        const response = await updateProfileMutation.mutateAsync(data);
        if (response.succeeded && response.ResponseCode === 200) {
          dispatch(updateUserDetails(response.ResponseData));
          dispatch(setUserCity(response.ResponseData?.city));
          showToast({
            type: 'success',
            title: t('messages.success'),
            message: response.ResponseMessage || t('profile.profileUpdated') || 'Profile updated successfully.',
          });
          setTimeout(() => {
            navigation.goBack();
          }, 1000);
        } else {
          showToast({
            type: 'error',
            title: t('messages.error'),
            message: response.ResponseMessage || t('profile.profileUpdateFailed') || 'Failed to update profile. Please try again.',
          });
        }
      } catch (error: any) {
        console.error('Update profile error:', error);
        showToast({
          type: 'error',
          title: t('messages.error') || 'Error',
          message: error?.response?.data?.ResponseMessage || t('messages.somethingWentWrong') || 'Failed to update profile. Please try again.',
        });
      }
    },
  });

  const handleCountrySelect = (country: Country) => {
    console.log('country------handleCountrySelect', country);
    setSelectedCountry(country);
    // Reset city when country changes
    setSelectedCity(null);
    formik.setFieldValue('country', country._id, false);
    formik.setFieldValue('city', '', false);
    formik.setFieldTouched('city', false, false);
    formik.validateField('country');
    setShowCountryModal(false);
  };

  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
    formik.setFieldValue('city', city._id, false);
    setShowCityModal(false);
    setTimeout(() => {
      formik.setFieldTouched('city', true);
      formik.validateField('city');
    }, 100);
  };
  const handleFormSubmit = () => {
    // Mark all fields as touched to show errors
    formik.setTouched({
      name: true,
      email: true,
      contact: true,
      country: true,
      city: true,
    });

    formik.validateForm().then((errors) => {
      if (Object.keys(errors).length === 0) {
        formik.handleSubmit();
      } else {
        console.log('Validation errors:', errors);
        // Show first error in toast
        const firstError = Object.values(errors)[0];
        if (firstError) {
          showToast({
            type: 'error',
            title: t('messages.error') || 'Error',
            message: firstError as string,
          });
        }
      }
    });
  };

  const uploadDocumentMutation = useUploadDocument();
  // add image----
  const handleImageSelected = async (image: any) => {
    setShowImagePicker(false);
    // Upload the image
    try {
      const response = await uploadDocumentMutation.mutateAsync({
        docType: 'profile',
        document: image,
      });
      console.log('response------handleImageSelected', response);
      if (response.succeeded && response.ResponseCode === 201 && response.ResponseData.url) {
        setProfileImage(response.ResponseData.url);
      } else {
        showToast({
          type: 'error',
          title: t('messages.error') || 'Error',
          message: response.ResponseMessage || t('profile.imageUploadFailed') || 'Failed to upload image. Please try again.',
        });
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      showToast({
        type: 'error',
        title: t('messages.error') || 'Error',
        message: error?.response?.data?.ResponseMessage || t('profile.imageUploadFailed') || 'Failed to upload image. Please try again.',
      });
    }
  };

  return (
    <Container safeArea={true} style={styles.container}>
      <AppHeader
        title={t('profile.profileSetup')}
        onLeftPress={() => navigation.goBack()}
      />
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid={false}
        extraScrollHeight={100}
        keyboardShouldPersistTaps="handled"
        enableResetScrollToCoords={false}
      >

        {/* Profile Picture Section */}
        <View style={styles.profileSection}>

          <View style={styles.profileImageContainer}>
            {
              profileImage && profileImage !== '' ? (
                <ImageLoader
                  source={{ uri: profileImage }}
                  mainImageStyle={styles.profileImage}
                  resizeMode="cover"
                />
              ) : (
                <>
                  {
                    uploadDocumentMutation?.isPending ?
                      <View style={styles.loadingContainer}> <ActivityIndicator size="large" color={theme.colors.primary} /></View>
                      : (
                        <ImageLoader
                          source={imagePaths.no_user_img}
                          mainImageStyle={styles.profileImage}
                          resizeMode="cover" />
                      )
                  }
                </>
              )}
            <Pressable
              style={styles.cameraIconContainer}
              onPress={() => { setShowImagePicker(true) }}
            >
              <View style={styles.cameraIconBackground}>
                <VectoreIcons
                  icon="Ionicons"
                  name="camera"
                  size={theme.SF(16)}
                  color={theme.colors.white}
                />
              </View>
            </Pressable>
          </View>
        </View>

        {/* Input Fields Section */}
        <View style={styles.inputSection}>
          <View style={styles.inputWrapper}>
            <CustomText
              variant="h5"
              style={styles.label}
              fontFamily={theme.fonts.MEDIUM}
            >
              Full Name
            </CustomText>
            <CustomInput
              placeholder={t('placeholders.enterFullName')}
              value={formik.values.name}
              onChangeText={formik.handleChange('name')}
              onBlur={formik.handleBlur('name')}
              withBackground={theme.colors.white}
              maxLength={70}
              marginTop={theme.SH(5)}
              errortext={formik.touched.name && formik.errors.name ? formik.errors.name : ''}
            />
          </View>

          <View style={styles.inputWrapper}>
            <CustomText
              variant="h5"
              style={styles.label}
              fontFamily={theme.fonts.MEDIUM}
            >
              Mobile Number
            </CustomText>
            <View style={styles.contactContainer}>
              <Pressable
                style={styles.countryCodeContainer}
                onPress={() => setShowCountryModal(true)}
              >
                <CountryCodeSelector
                  borderColor='#000000'
                  countryCode={selectedCountry?.phoneCode?.toString() || ''}
                  onPress={() => setShowCountryModal(true)}
                />
              </Pressable>
              <View style={styles.phoneInputContainer}>
                <CustomInput
                  leftIcon={imagePaths.mobile_icon}
                  placeholder={t('placeholders.mobileno')}
                  withBackground={theme.colors.white}
                  value={formik.values.contact}
                  onChangeText={formik.handleChange('contact')}
                  onBlur={formik.handleBlur('contact')}
                  keyboardType='number-pad'
                  errortext={formik.touched.contact && formik.errors.contact ? formik.errors.contact : ''}
                />
              </View>
            </View>
            {formik.touched.country && formik.errors.country && (
              <View style={{ marginTop: theme.SH(5), marginLeft: theme.SW(5) }}>
                <CustomText
                  fontSize={theme.fontSize.xxs}
                  color={theme.colors.errorText || '#FF0000'}
                >
                  {formik.errors.country}
                </CustomText>
              </View>
            )}
          </View>
          {/* City Selection */}
          <View style={styles.inputWrapper}>
            <CustomText
              variant="h5"
              style={styles.label}
              fontFamily={theme.fonts.MEDIUM}
            >
              City
            </CustomText>
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
                leftIcon={imagePaths.city}
                placeholder={t('placeholders.selectCity')}
                errortext={formik.touched.city && formik.errors.city ? formik.errors.city : ''}
                withBackground={theme.colors.white}
                value={selectedCity?.name || ''}
                editable={false}
                isEditable={false}
                marginTop={theme.SH(5)}
                rightIcon={imagePaths.right_icon}
              />
            </Pressable>
          </View>
          <View style={styles.inputWrapper}>
            <CustomText
              variant="h5"
              style={styles.label}
              fontFamily={theme.fonts.MEDIUM}
            >
              Email ID
            </CustomText>
            <CustomInput
              placeholder={t('placeholders.enterEmail')}
              value={formik.values.email}
              editable={false}
              onChangeText={formik.handleChange('email')}
              keyboardType="email-address"
              withBackground={theme.colors.white}
              marginTop={theme.SH(8)}
              errortext={formik.touched.email && formik.errors.email ? formik.errors.email : ''}
            />
          </View>
        </View>
        <CustomButton
          title={t('placeholders.save')}
          isLoading={updateProfileMutation?.isPending}
          disable={updateProfileMutation?.isPending}
          onPress={handleFormSubmit}
          backgroundColor={theme.colors.primary}
          textColor={theme.colors.white}
          buttonStyle={styles.saveButton}
        />

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
      {/* Image Picker Modal */}
      <ImagePickerModal
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onImageSelected={handleImageSelected}
      />
    </Container>
  );
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background || '#F7F7F7',
      paddingHorizontal: theme.SW(20),
    },
    scrollContent: {
      flexGrow: 1,
      paddingTop: theme.SH(20),
      paddingBottom: theme.SH(100),
    },
    profileSection: {
      alignItems: 'center',
      marginBottom: theme.SH(30),
    },
    profileImageContainer: {
      position: 'relative',
      marginBottom: theme.SH(16),
      justifyContent: 'center',
      alignItems: 'center',
    },
    profileImage: {
      width: theme.SW(90),
      height: theme.SW(90),
      borderRadius: theme.SW(45),
      borderWidth: 2,
      borderColor: theme.colors.white,
    },
    cameraIconContainer: {
      position: 'absolute',
      bottom: 0,
      right: 0,
    },
    cameraIconBackground: {
      width: theme.SW(30),
      height: theme.SW(30),
      borderRadius: theme.SW(15),
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: theme.colors.white,
    },
    nameText: {
      marginTop: theme.SH(8),
      color: theme.colors.text,
    },
    phoneText: {
      marginTop: theme.SH(4),
    },
    inputSection: {
      width: '100%',
    },
    inputWrapper: {
      marginTop: theme.SH(20),
    },
    label: {
      color: theme.colors.text,
      marginBottom: theme.SH(4),
    },
    buttonContainer: {

      paddingHorizontal: theme.SW(20),
      paddingBottom: Platform.OS === 'ios' ? theme.SH(20) : theme.SH(30),
      paddingTop: theme.SH(16),
      backgroundColor: theme.colors.background || '#F7F7F7',
      borderTopWidth: 1,
      borderTopColor: theme.colors.secondary,
    },
    saveButton: {
      borderRadius: theme.borderRadius.md,
      height: theme.SF(45),
      marginTop: theme.SF(40),
    },
    contactContainer: {
      flexDirection: 'row',
      gap: theme.SW(10),
      marginTop: theme.SH(5),
    },
    countryCodeContainer: {
      width: theme.SW(90),
    },
    phoneInputContainer: {
      flex: 1,
    },
    loadingContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      width: theme.SW(90),
      height: theme.SW(90),
      borderRadius: theme.SW(45),
      backgroundColor: theme.colors.white,
    },
  });
