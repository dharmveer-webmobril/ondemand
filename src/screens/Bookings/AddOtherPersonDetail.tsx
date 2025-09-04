import React, { use, useEffect } from 'react';
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
import { Colors, Fonts, navigate, regex, SF, SH, SW } from '../../utils';
import { useNavigation } from '@react-navigation/native';
import imagePaths from '../../assets/images';
import { useTranslation } from 'react-i18next';
import VectorIcon from '../../component/VectoreIcons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import RouteName from '../../navigation/RouteName';
import { useRoute } from '@react-navigation/native'; // Import useRoute to get params
import { useDispatch, useSelector } from 'react-redux';
import { RootState, setBookingJson, useSubmitOtherUserAddressMutation } from '../../redux';

type ProfileSetupProps = {};
const ProfileSetup: React.FC<ProfileSetupProps> = ({ }) => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>(); // Get route params
  const addressFromPreviousPage = route.params?.address || ''; // Default to empty if not provided
  const [address, setAddress] = React.useState<any>(null);
  const validationSchema = Yup.object().shape({
    fname: Yup.string().trim()
      .min(3, t('validation.fullnameMinLength'))
      .required(t('validation.emptyFullName'))
      .matches(regex.NAME_REGEX, t('validation.validFullName')),
    email: Yup.string().trim()
      .matches(regex.EMAIL_REGEX_WITH_EMPTY, t('validation.validEmail'))
      .required(t('validation.emptyEmail')),
    mobileno: Yup.string().trim()
      .matches(regex.MOBIILE, t('validation.validMobile'))
      .required(t('validation.emptyMobile')),
    address: Yup.string().trim()
      .required('Address is required')
      .min(5, 'Minimum length 5'), // Minimum length of 5 characters
  });
  const bookingJson = useSelector((state: RootState) => state.service.bookingJson);
  const [submitData] = useSubmitOtherUserAddressMutation()
  const dispatch = useDispatch();

  const btnSubmit = async (values: any) => {
    console.log('Form Values:', values);
    let data = {
      "name": values.fname,
      "email": values.email,
      "phone": values.mobileno,
      "address": {
        "type": "Home",
        "streetAddress": address?.type || "",
        "apartment": address?.apartment || "",
        "city": address?.city || "",
        "state": address?.state || "",
        "zip": address?.zip || "",
        "country": address?.country || "",
        "location": address?.location
      }
    };
    try {
      const response = await submitData({ data }).unwrap();
      console.log('Response---:', response);
      if (response.success) {
        let bookingData = { ...bookingJson, otherUserAddress: response.data, otherUserAddressId: response.data._id };
        dispatch(setBookingJson(bookingData));
        navigation.navigate(RouteName.PAYMENT_SCREEN);
        // goBack();
      } else {
        // handleApiFailureResponse(response, '');
      }
    } catch (error) {
      console.log('errorerror', error);
    }

    // Here you can handle the form submission, e.g., save to database or navigate
    // navigation.navigate(RouteName.PAYMENT_SCREEN);
  };

  const otherUserAddress = useSelector((state: RootState) => state.service.otherUserAddress);
  console.log('otherUserAddress:', otherUserAddress);

  return (
    <Container isPadding={false}>
      <AppHeader
        headerTitle={'Booking Appointment'}
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
              address: addressFromPreviousPage, // Pre-fill with address from previous page
            }}
            validationSchema={validationSchema}
            onSubmit={(values, { resetForm }) => {
              btnSubmit(values);
              // navigation.navigate(RouteName.PAYMENT_SCREEN)
            }}>
            {({ handleChange, handleSubmit, handleBlur, values, errors, touched, setFieldTouched, setFieldValue }) => {

              useEffect(() => {
                if (otherUserAddress) {
                  setFieldValue('address', otherUserAddress.streetAddress || '');
                  setAddress(otherUserAddress);
                }
              }, [otherUserAddress, setFieldValue]);
              // {({
              //   handleChange,
              //   setFieldTouched,
              //   handleSubmit,
              //   setFieldValue,
              //   values,
              //   errors,
              //   touched,
              // }) => (
              return <>
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
                {/* <View style={styles.addressContainer}>
                  <View style={styles.addressInfo}>
                    <AppText style={styles.addressName}>Home Address</AppText>
                    <AppText style={styles.addressDetail}>{values.address || 'No address set'}</AppText>
                  </View>
                  <TouchableOpacity style={styles.addressMoreIcon}>
                    <VectorIcon
                      icon="Entypo"
                      name="dots-three-vertical"
                      size={SW(20)}
                      color={Colors.textAppColor}
                    />
                  </TouchableOpacity>
                </View> */}

                <TouchableOpacity onPress={() => { navigate(RouteName.ADD_ADDRESS, { prevScreen: 'other_user' }) }}>
                  <InputField
                    label={"Select Address"}
                    value={values.address}
                    editable={false}
                    // onChangeText={handleChange('address')}
                    // onBlur={() => setFieldValue('address', values.address.trim())}
                    // errorMessage={touched.address && errors.address && errors.address ? errors.address : ''}
                    errorMessage={touched.address && errors.address ? String(errors.address) : ''}
                    keyboardType="default"
                    color={Colors.textAppColor}
                    textColor={Colors.textAppColor}
                  />
                </TouchableOpacity>
                {/* <AppText>{touched.address && errors.address && errors.address ? errors.address : ''}</AppText> */}

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
            }}
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
    marginTop: SH(4)
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