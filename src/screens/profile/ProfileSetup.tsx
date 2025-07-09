import React from 'react';
import {
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  AppHeader,
  Container,
  ImageLoader,
  Spacing,
  Buttons,
  InputField,
  AppText
} from '../../component';
import { Colors, Fonts, regex, SF, SH, SW } from '../../utils';
import { useNavigation } from '@react-navigation/native';
import imagePaths from '../../assets/images';
import { useTranslation } from 'react-i18next';
import VectorIcon from '../../component/VectoreIcons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

type ProfileSetupProps = {};
const ProfileSetup: React.FC<ProfileSetupProps> = ({ }) => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const validationSchema = Yup.object().shape({
    fname: Yup.string()
      .min(3, t('validation.fullnameMinLength'))
      .required(t('validation.emptyFullName'))
      .matches(regex.NAME_REGEX, t('validation.validFullName')),
    email: Yup.string()
      .matches(regex.EMAIL_REGEX_WITH_EMPTY, t('validation.validEmail'))
      .required(t('validation.emptyEmail')),
    mobileno: Yup.string()
      .matches(regex.DIGIT_REGEX, t('validation.validMobile'))
      .min(10, t('validation.mobileMinLen'))
      .required(t('validation.emptyMobile')),
  });
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
        extraScrollHeight={SH(40)}>
        <View style={styles.container}>
          <View style={styles.profileContainer}>
            <View style={styles.userConImage}>
              <ImageLoader
                source={imagePaths.user_img}
                resizeMode="cover"
                mainImageStyle={styles.userImage}
              />
              <TouchableOpacity style={styles.editIcon}>
                <VectorIcon
                  color={Colors.textWhite}
                  size={SW(12)}
                  name="camera"
                  icon="Entypo"
                />
              </TouchableOpacity>
            </View>
            <View style={styles.userInfo}>
              <AppText style={styles.userName}>John Kevin</AppText>
              <AppText style={styles.userPhone}>+91 1234567890</AppText>
            </View>
          </View>
          <Formik
            initialValues={{
              fname: '',
              mobileno: '',
              email: '',
            }}
            validationSchema={validationSchema}
            onSubmit={(values, { resetForm }) => {
              // btnSignup(values, resetForm);
            }}>
            {({
              handleChange,
              setFieldTouched,
              handleSubmit,
              setFieldValue,
              values,
              errors,
              touched,
            }) => (
              <>

                <InputField
                  label={t('placeholders.fullname')}
                  value={values.fname}
                  onChangeText={handleChange('fname')}
                  onBlur={() => setFieldValue('fname', values.fname.trim())}
                  errorMessage={touched.fname && errors.fname && errors.fname ? errors.fname : ''}
                  keyboardType="default"
                  color={Colors.textAppColor}
                  textColor={Colors.textAppColor}
                />
                <InputField
                  label={t('placeholders.mobileno')}
                  value={values.mobileno}
                  onChangeText={handleChange('mobileno')}
                  onBlur={() => setFieldValue('mobileno', values.mobileno.trim())}
                  errorMessage={touched.mobileno && errors.mobileno && errors.mobileno ? errors.mobileno : ''}
                  keyboardType={'number-pad'}
                  color={Colors.textAppColor}
                  textColor={Colors.textAppColor}
                />

                <InputField
                  label={t('placeholders.emailId')}
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={() => setFieldValue('email', values.email.trim())}
                  errorMessage={touched.email && errors.email && errors.email ? errors.email : ''}
                  keyboardType={'email-address'}
                  color={Colors.textAppColor}
                  textColor={Colors.textAppColor}
                />
               
                <Spacing space={SH(20)} />
                <View style={styles.addressContainer}>
                  <View style={styles.addressInfo}>
                    <AppText style={styles.addressName}>Home Address</AppText>
                    <AppText style={styles.addressDetail}>123 main st, anytown, USA</AppText>
                  </View>
                  <TouchableOpacity style={styles.addressMoreIcon}>
                    <VectorIcon
                      icon="Entypo"
                      name="dots-three-vertical"
                      size={SW(20)}
                      color={Colors.textAppColor}
                    />
                  </TouchableOpacity>
                </View>

                <Buttons
                  buttonStyle={styles.addAddressButton}
                  textColor={Colors.textWhite}
                  buttonTextStyle={styles.addAddressText}
                  title={t('placeholders.AddNewAddress')}
                  onPress={() => {
                    //   handleSubmit();
                    Keyboard.dismiss();
                  }}
                // isLoading={true}
                />

                <Buttons
                  buttonStyle={styles.submitButton}
                  textColor={Colors.textWhite}
                  title={t('placeholders.save')}
                  onPress={() => {
                    handleSubmit();
                    Keyboard.dismiss();
                  }}
                // isLoading={true}
                />
              </>
            )}
          </Formik>
        </View>
      </KeyboardAwareScrollView>
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
  },
  userPhone: {
    fontFamily: Fonts.REGULAR,
    fontSize: SF(12),
    marginTop: SH(5),
  },
  inputText: {
    color: Colors.textAppColor,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: Colors.textAppColor,
  },
  addressContainer: {
    borderRadius: SW(10),
    paddingVertical: SW(15),
    paddingHorizontal: SW(15),
    borderWidth: 1,
    borderColor: Colors.textAppColor,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addressInfo: {
    width: '80%',
  },
  addressName: {
    fontFamily: Fonts.SEMI_BOLD,
    fontSize: SF(12),
  },
  addressDetail: {
    fontFamily: Fonts.REGULAR,
    fontSize: SF(12),
    marginTop:SH(4)
  },
  addressMoreIcon: {
    paddingVertical: 5,
    paddingLeft: 5,
  },
  addAddressButton: {
    backgroundColor: Colors.themeColor,
    height: SF(28),
    width: SF(124),
    marginTop: 15,
    alignSelf: 'flex-end',
    borderRadius: 5,
  },
  addAddressText: {
    fontSize: SF(12),
  },
  submitButton: {
    backgroundColor: Colors.themeColor,
    marginTop: SH(70),
  },
});
