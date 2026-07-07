import { useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {
  Container,
  AppHeader,
  CustomInput,
  CustomButton,
  CustomText,
  ImageLoader,
  VectoreIcons,
  showToast,
  ImagePickerModal,
} from '@components';
import PhoneCountryPicker from '@components/auth/PhoneCountryPicker';
import { ThemeType, useThemeContext } from '@utils/theme';
import { useNavigation } from '@react-navigation/native';
import imagePaths from '@assets';
import { KeyboardFormScroll } from '@components/common';
import { useUpdateProfile, useUploadDocument } from '@services/index';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { updateUserDetails } from '@store/slices/authSlice';
import regex from '@utils/regexList';
import { isValidNationalPhoneNumber } from '@utils/phoneValidation';

export default function ProfileSetup() {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const userDetails = useAppSelector((state) => state.auth.userDetails);
  const [profileImage, setProfileImage] = useState('');
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [hasInitializedFromUserData, setHasInitializedFromUserData] =
    useState(false);

  // Initialize from userData (only once)
  useEffect(() => {
    if (userDetails && !hasInitializedFromUserData) {
      const storedContact = String(userDetails?.contact || '');
      const storedPhoneCode = String(userDetails?.phoneCode || '').trim();
      const storedIso2 = String(
        userDetails?.countryIso2 || userDetails?.country?.countryCode || '',
      ).toLowerCase();

      // Best-effort split if `contact` was stored as a single E.164 string.
      let dialCode = storedPhoneCode || '+91';
      let nationalNumber = storedContact;
      if (!storedPhoneCode && storedContact.startsWith('+')) {
        const match = storedContact.match(/^(\+\d{1,4})(\d+)$/);
        if (match) {
          dialCode = match[1];
          nationalNumber = match[2];
        }
      }

      formik.setValues({
        name: userDetails?.name || '',
        email: userDetails?.email || '',
        nationalNumber: nationalNumber.replace(/\D/g, ''),
        phoneDialCode: dialCode || '+91',
        phoneCountryIso2: storedIso2 || 'in',
      });

      setProfileImage(userDetails?.profileImage || '');
      setHasInitializedFromUserData(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userDetails, hasInitializedFromUserData]);

  const validationSchema = useMemo(
    () =>
      Yup.object().shape({
        name: Yup.string()
          .min(3, t('validation.fullNameMinLength'))
          .matches(regex.NAME_REGEX, t('validation.validFullName'))
          .required(t('validation.emptyFullName')),
        email: Yup.string()
          .email(t('validation.validEmail'))
          .required(t('validation.emptyEmail')),
        phoneDialCode: Yup.string().required(),
        phoneCountryIso2: Yup.string().required(),
        nationalNumber: Yup.string()
          .required(t('validation.emptyMobile'))
          .test('phone-valid', t('validation.validMobile'), function (value) {
            const iso = this.parent.phoneCountryIso2;
            if (!iso || value == null || value === '') return false;
            return isValidNationalPhoneNumber(String(value), String(iso));
          }),
      }),
    [t],
  );

  const updateProfileMutation = useUpdateProfile();
  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      nationalNumber: '',
      phoneDialCode: '+91',
      phoneCountryIso2: 'in',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const nationalDigits = String(values.nationalNumber || '').replace(
          /\D/g,
          '',
        );
        const rawDial = String(values.phoneDialCode || '').trim();
        const phoneCode = rawDial
          ? rawDial.startsWith('+')
            ? rawDial
            : `+${rawDial.replace(/^\++/, '')}`
          : '';

        const data = {
          name: values.name,
          email: values.email,
          contact: nationalDigits,
          phoneCode,
          countryIso2: values.phoneCountryIso2,
          profileImage: profileImage,
        };

        const response = await updateProfileMutation.mutateAsync(data);
        if (response.succeeded && response.ResponseCode === 200) {
          dispatch(updateUserDetails(response.ResponseData));
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
          title: t('messages.error'),
          message: error?.response?.data?.ResponseMessage || t('messages.somethingWentWrong') || 'Failed to update profile. Please try again.',
        });
      }
    },
  });

  const handleFormSubmit = () => {
    formik.setTouched({
      name: true,
      email: true,
      nationalNumber: true,
      phoneDialCode: true,
      phoneCountryIso2: true,
    });

    formik.validateForm().then((errors) => {
      if (Object.keys(errors).length === 0) {
        formik.handleSubmit();
      } else {
        const firstError = Object.values(errors)[0];
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
          title: t('messages.error'),
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
      <KeyboardFormScroll contentContainerStyle={styles.scrollContent}>

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
              {t('profile.fullName')}
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
              {t('profile.mobileNumber')}
            </CustomText>
            <PhoneCountryPicker
              inputTheme="default"
              marginTop={theme.SH(5)}
              dialCode={formik.values.phoneDialCode}
              nationalNumber={formik.values.nationalNumber}
              onSelectionChange={next => {
                formik.setFieldValue('phoneDialCode', next.dialCode);
                formik.setFieldValue('phoneCountryIso2', next.countryIso2);
                setTimeout(() => {
                  if (formik.values.nationalNumber) {
                    formik.validateField('nationalNumber');
                  }
                }, 50);
              }}
              onNationalNumberChange={digits =>
                formik.setFieldValue('nationalNumber', digits)
              }
              onNationalBlur={() =>
                formik.setFieldTouched('nationalNumber', true)
              }
              phonePlaceholder={t('placeholders.mobileno')}
              errorText={
                formik.touched.nationalNumber && formik.errors.nationalNumber
                  ? (formik.errors.nationalNumber as string)
                  : ''
              }
            />
          </View>
          <View style={styles.inputWrapper}>
            <CustomText
              variant="h5"
              style={styles.label}
              fontFamily={theme.fonts.MEDIUM}
            >
              {t('profile.emailID')}
            </CustomText>
            <CustomInput
              placeholder={t('placeholders.enterEmail')}
              value={formik.values.email}
              isEditable={false}
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

      </KeyboardFormScroll>
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
    loadingContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      width: theme.SW(90),
      height: theme.SW(90),
      borderRadius: theme.SW(45),
      backgroundColor: theme.colors.white,
    },
  });
