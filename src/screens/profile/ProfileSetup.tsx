import React, { useEffect, useState } from 'react';
import {
  Image,
  Keyboard,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  AppHeader,
  Container,
  Spacing,
  Buttons,
  InputField,
  AppText,
  ImagePickerModal,
  CountryPickerComp,
} from '../../component';
import { Colors, Fonts, goBack, handleApiError, handleApiFailureResponse, handleSuccessToast, profileSetupValidationSchema, regex, SF, SH, SW } from '../../utils';
import { useNavigation } from '@react-navigation/native';
import imagePaths from '../../assets/images';
import { useTranslation } from 'react-i18next';
import VectorIcon from '../../component/VectoreIcons';
import { Formik } from 'formik';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, setUserProfileData, useUpdateProfileMutation } from '../../redux';

interface ImageType {
  path: string;
  name?: string;
  mime?: string;
}

type ProfileSetupProps = {};
const ProfileSetup: React.FC<ProfileSetupProps> = ({ }) => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const [imagePickerModal, setImagePickerModal] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<ImageType | null>(null);

  const userData = useSelector((state: RootState) => state.auth.user);
  const initialValues = {
    fname: userData?.fullName || '',
    mobileno: userData?.mobileNo || '',
    email: userData?.email || '',
    countryCode: userData?.countryCode || '',
  };

  useEffect(() => {
    if (userData?.profilePic && !profileImage) {
      setProfileImage({ path: userData.profilePic, name: userData?.profilePic?.split('/')?.pop() || 'profile.jpg', mime: 'image/jpeg' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.profilePic]);

  const [editProfile, { isLoading }] = useUpdateProfileMutation();
  const dispatch = useDispatch();

  const btnSignup = async (values: { fname: string; mobileno: string; email: string; countryCode: string }, { resetForm }: { resetForm: () => void }) => {
    Keyboard.dismiss();

    try {
      const formData = new FormData();
      profileImage && formData.append('profilePic', {
        uri: profileImage.path,
        name: profileImage.name || 'profile.jpg',
        type: profileImage?.mime || 'image/jpg',
      } as any);

      formData.append('fullName', values.fname);
      formData.append('mobileNo', values.mobileno);
      formData.append('countryCode', values.countryCode);
      console.log('formDataformData', formData);
      // return
      const response = await editProfile(formData).unwrap();
      console.log('res', response);
      if (response.success) {
        handleSuccessToast(response.message || 'Profile edit successfully');
        dispatch(setUserProfileData(response?.data || {}));
        resetForm?.();
        goBack();
      } else {
        handleApiFailureResponse(response, 'Error occured in edit profile');
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleImageSelected = (img: ImageType) => {

    setProfileImage(img);
    setImagePickerModal(false);
  };

  return (
    <Container isPadding={false}>
      <AppHeader
        headerTitle={t('profile.profileSetup')}
        onPress={() => {
          navigation.goBack();
        }}
        Iconname="arrowleft"
        rightOnPress={() => { }}
        headerStyle={styles.header}
      />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        extraScrollHeight={SH(40)}
      >
        <View style={styles.container}>
          <View style={styles.profileContainer}>
            <View style={styles.userConImage}>
              <Image
                source={profileImage ? { uri: profileImage.path } : { uri: imagePaths.defaultUser }}
                resizeMode="cover"
                style={styles.userImage}
              />
              <TouchableOpacity style={styles.editIcon} onPress={() => setImagePickerModal(true)}>
                <VectorIcon
                  color={Colors.textWhite}
                  size={SW(12)}
                  name="camera"
                  icon="Entypo"
                />
              </TouchableOpacity>
            </View>
            <View style={styles.userInfo}>
              <AppText style={styles.userName}>{userData?.fullName || 'John Kevin'}</AppText>
              <AppText style={styles.userPhone}>{userData?.phoneNumber || '+91 1234567890'}</AppText>
            </View>
          </View>
          <Formik
            initialValues={initialValues}
            validationSchema={profileSetupValidationSchema(t, regex)}
            onSubmit={(values, formikBag) => {
              btnSignup(values, formikBag);
            }}
          >
            {({
              handleChange,
              setFieldValue,
              values,
              errors,
              touched,
              handleSubmit,
              setFieldTouched,
            }) => (
              <>
                <View style={styles.formContainer}>
                  <InputField
                    label={t('placeholders.fullname')}
                    value={values.fname}
                    onChangeText={handleChange('fname')}
                    onBlur={() => setFieldValue('fname', values.fname.trim())}
                    errorMessage={touched.fname && errors.fname ? String(errors.fname) : ''}
                    keyboardType="default"
                    color={Colors.textAppColor}
                    textColor={Colors.textAppColor}
                  />
                  <View style={styles.rowContainer}>
                    <TouchableOpacity
                      onPress={() => setIsPickerOpen(true)}
                      style={styles.countryCodeButton}
                    >
                      <AppText style={{ color: Colors.textAppColor, fontFamily: Fonts.MEDIUM }}>
                        {values.countryCode}
                      </AppText>
                    </TouchableOpacity>
                    <View style={styles.phoneInputContainer}>
                      <InputField
                        value={values.mobileno}
                        onChangeText={handleChange('mobileno')}
                        onBlur={() => setFieldTouched('mobileno')}
                        keyboardType="phone-pad"
                        color={Colors.textAppColor}
                        textColor={Colors.textAppColor}
                        maxLength={14}
                      />
                    </View>
                  </View>
                  {touched.mobileno && errors.mobileno && (
                    <AppText style={styles.errorText}>
                      {errors.mobileno ? String(errors.mobileno) : ''}
                    </AppText>
                  )}
                  <CountryPickerComp
                    isPickerOpen={isPickerOpen}
                    closeCountryPicker={() => setIsPickerOpen(false)}
                    openCountryPicker={() => setIsPickerOpen(true)}
                    inputText={''}
                    onInputChange={() => { }}
                    countryCode={values.countryCode}
                    setCountryCode={(code: string) => setFieldValue('countryCode', code)}
                  />
                  <InputField
                    label={t('placeholders.emailId')}
                    value={values.email}
                    editable={false}
                    onChangeText={handleChange('email')}
                    onBlur={() => setFieldValue('email', values.email.trim())}
                    errorMessage={touched.email && errors.email ? String(errors.email) : ''}
                    keyboardType="email-address"
                    color={Colors.textAppColor}
                    textColor={Colors.textAppColor}
                  />

                  <Spacing space={SH(20)} />
                </View>
                <Buttons
                  buttonStyle={styles.submitButton}
                  textColor={Colors.textWhite}
                  title={t('placeholders.save')}
                  isLoading={isLoading}
                  onPress={() => {
                    handleSubmit();
                    Keyboard.dismiss();
                  }}
                />
              </>
            )}
          </Formik>
        </View>
      </KeyboardAwareScrollView>
      <ImagePickerModal
        visible={imagePickerModal}
        onClose={() => setImagePickerModal(false)}
        onImageSelected={handleImageSelected}
      />
    </Container>
  );
};

export default ProfileSetup;

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.bgwhite,
    paddingHorizontal: SW(25),
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 0,
  },
  container: {
    paddingHorizontal: SW(25),
    paddingVertical: SH(20),
  },
  profileContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SH(20),
  },
  userConImage: {
    width: SF(70),
    height: SF(70),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.borderColor,
    borderRadius: SF(35),
  },
  userImage: {
    width: SF(66),
    height: SF(66),
    borderRadius: SF(33),
  },
  editIcon: {
    position: 'absolute',
    zIndex: 99,
    padding: 5,
    right: -5,
    bottom: 0,
    borderRadius: 6,
    backgroundColor: Colors.themeColor,
  },
  userInfo: {
    marginTop: 10,
  },
  userName: {
    fontFamily: Fonts.MEDIUM,
    fontSize: SF(16),
    textAlign: 'center',
  },
  userPhone: {
    fontFamily: Fonts.REGULAR,
    fontSize: SF(12),
    marginTop: SH(5),
    textAlign: 'center',
  },
  inputText: {
    color: Colors.textAppColor,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: Colors.textAppColor,
  },
  submitButton: {
    backgroundColor: Colors.themeColor,
    marginTop: SH(70),
  },
  formContainer: {
    flex: 1,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCodeButton: {
    paddingHorizontal: SW(10),
    paddingVertical: SH(12),
    borderWidth: 1,
    borderColor: Colors.textAppColor,
    borderRadius: SW(10),
    marginRight: SW(8),
    justifyContent: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: SF(12),
    marginBottom: SH(10),
  },
  phoneInputContainer: {
    flex: 1,
  },
});