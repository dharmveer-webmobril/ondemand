import React, { useEffect, useState, useMemo } from 'react';
import {
  Keyboard,
  StyleSheet,
  View,
  TouchableOpacity,
  Pressable,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  AppHeader,
  Container,
  CustomButton,
  CustomInput,
  CustomText,
  LoadingComp,
  CountryCodeSelector,
} from '@components';
import { CountryModal } from '@components';
import { Colors, Fonts, regex, SF, SH, SW } from '@utils';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import SCREEN_NAMES from '@navigation/ScreenNames';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useGetCountries, useGetCustomerAddresses } from '@services/index';
import { Address } from '@services/api/queries/appQueries';
import imagePaths from '@assets';

interface FormValues {
  fname: string;
  mobileno: string;
  email: string;
  countryCode: string;
  address: string;
}

const AddOtherPersonDetail: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const addressFromPreviousPage = route.params?.address || '';
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showCountryModal, setShowCountryModal] = useState<boolean>(false);

  // Get countries for country code selector
  const { data: countriesData } = useGetCountries();
  const countries = useMemo(() => countriesData?.ResponseData || [], [countriesData]);

  // Refetch addresses when returning from AddAddress screen
  const { refetch: refetchAddresses } = useGetCustomerAddresses();

  const validationSchema = Yup.object().shape({
    fname: Yup.string()
      .trim()
      .min(3, t('validation.fullnameMinLength'))
      .required(t('validation.emptyFullName'))
      .matches(regex.NAME_REGEX, t('validation.validFullName')),
    email: Yup.string()
      .trim()
      .matches(regex.EMAIL_REGEX_WITH_EMPTY, t('validation.validEmail'))
      .required(t('validation.emptyEmail')),
    mobileno: Yup.string()
      .trim()
      .matches(regex.MOBILE, t('validation.validMobile'))
      .required(t('validation.emptyMobile')),
    address: Yup.string()
      .trim()
      .required(t('addAddress.validation.line1Empty') || 'Address is required')
      .min(5, 'Minimum length 5'),
  });

  const formik = useFormik<FormValues>({
    initialValues: {
      fname: '',
      mobileno: '',
      email: '',
      countryCode: '+91',
      address: addressFromPreviousPage,
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      Keyboard.dismiss();
      try {
        if (!selectedAddress) {
          formik.setFieldTouched('address', true);
          setSubmitting(false);
          return;
        }

        const data = {
          name: values.fname,
          email: values.email,
          phone: values.mobileno,
          countryCode: values.countryCode,
          address: selectedAddress,
        };

        console.log('Other Person Data:', data);
        const onSelect = route.params?.onSelect;
        if (onSelect) {
          onSelect(data);
        }
        navigation.goBack();
        // Pass data back to Checkout screen via navigation params
        // The Checkout screen should listen for this data
        // navigation.navigate({
        //   name: SCREEN_NAMES.CHECKOUT,
        //   params: {
        //     otherPersonData: data,
        //     updateOtherPerson: true,
        //   },
        //   merge: true,
        // } as never);
      } catch (error) {
        console.error('Error submitting other person details:', error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Format address for display
  const formatAddress = (address: Address | null) => {
    if (!address) return '';
    const parts = [address.line1];
    if (address.line2) parts.push(address.line2);
    if (address.landmark) parts.push(address.landmark);
    return parts.join(', ');
  };

  // Handle address selection when returning from SelectAddress or AddAddress screens
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Refetch addresses when screen comes into focus (in case new address was added)
      refetchAddresses();

      // Check if address was selected from SelectAddress screen (via callback)
      // The onSelect callback in handleSelectAddress will handle it
      // For AddAddress with prevScreen='other_user', it just goes back without data
      // User will need to select the address manually after adding it
      const addressFromRoute = route.params?.selectedAddress || route.params?.address;
      if (addressFromRoute) {
        setSelectedAddress(addressFromRoute);
        formik.setFieldValue('address', formatAddress(addressFromRoute));
        setTimeout(() => {
          formik.setFieldTouched('address', true);
        }, 100);
      }
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation, route.params, refetchAddresses]);

  const handleSelectAddress = () => {
    navigation.navigate(SCREEN_NAMES.SELECT_ADDRESS as never, {
      onSelect: (address: Address) => {
        setSelectedAddress(address);
        formik.setFieldValue('address', formatAddress(address));
        setTimeout(() => {
          formik.setFieldTouched('address', true);
        }, 100);
      },
    } as never);
  };

  // const handleAddNewAddress = () => {
  //   navigation.navigate(SCREEN_NAMES.ADD_ADDRESS, {
  //     prevScreen: 'other_user',
  //   });
  // };

  return (
    <Container safeArea={true}>
      <LoadingComp visible={formik.isSubmitting} />
      <AppHeader
        title={t('checkout.otherPersonDetails') || 'Other Person Details'}
        onLeftPress={() => navigation.goBack()}
        containerStyle={styles.header}
      />

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        extraScrollHeight={SH(40)}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            {/* Full Name */}
            <CustomText style={styles.label}>{t('placeholders.fullname') || 'Full Name'}</CustomText>
            <CustomInput
              placeholder={t('placeholders.fullname') || 'Full Name'}
              value={formik.values.fname}
              onChangeText={(val: string) => {
                formik.setFieldValue('fname', val);
              }}
              onBlur={() => {
                formik.setFieldTouched('fname', true);
                formik.setFieldValue('fname', formik.values.fname.trim());
              }}
              errortext={formik.touched.fname && formik.errors.fname ? formik.errors.fname : ''}
              keyboardType="default"
              maxLength={50}
              marginTop={SH(5)}
            />

            {/* Email */}
            <CustomText style={styles.label}>{t('placeholders.emailId') || 'Email'}</CustomText>
            <CustomInput
              placeholder={t('placeholders.emailId') || 'Email'}
              value={formik.values.email}
              onChangeText={(val: string) => {
                formik.setFieldValue('email', val);
              }}
              onBlur={() => {
                formik.setFieldTouched('email', true);
                formik.setFieldValue('email', formik.values.email.trim());
              }}
              errortext={formik.touched.email && formik.errors.email ? formik.errors.email : ''}
              keyboardType="email-address"
              autoCapitalize="none"
              marginTop={SH(5)}
            />

            {/* Mobile Number */}
            <CustomText style={styles.label}>{t('placeholders.mobileno') || 'Mobile Number'}</CustomText>
            <View style={styles.rowContainer}>
              <Pressable
                onPress={() => setShowCountryModal(true)}
                style={styles.countryCodeButton}
                disabled={true}
              >
                <CountryCodeSelector
                  countryCode={formik.values.countryCode}
                  onPress={() => {
                    // setShowCountryModal(true)
                  }}
                  borderColor={Colors.textInputBorder}
                />
              </Pressable>
              <View style={styles.phoneInput}>
                <CustomInput
                  placeholder={t('placeholders.mobileno') || 'Mobile Number'}
                  value={formik.values.mobileno}
                  onChangeText={(val: string) => {
                    formik.setFieldValue('mobileno', val);
                  }}
                  onBlur={() => formik.setFieldTouched('mobileno', true)}
                  errortext={formik.touched.mobileno && formik.errors.mobileno ? formik.errors.mobileno : ''}
                  keyboardType="phone-pad"
                  maxLength={15}
                />
              </View>
            </View>

            {/* Address Selection */}
            <CustomText style={styles.label}>{t('placeholders.selectAddress') || 'Select Address'}</CustomText>
            <TouchableOpacity onPress={handleSelectAddress} activeOpacity={0.7}>
              <CustomInput
                placeholder={t('placeholders.selectAddress') || 'Select Address'}
                value={formik.values.address}
                onChangeText={() => { }} // Read-only
                onBlur={() => formik.setFieldTouched('address', true)}
                errortext={formik.touched.address && formik.errors.address ? formik.errors.address : ''}
                keyboardType="default"
                isEditable={false}
                marginTop={SH(5)}
                readOnly={true}
                rightIcon={imagePaths.right_icon}
              />
            </TouchableOpacity>

            {/* {!selectedAddress && (
              <CustomButton
                title={t('selectAddress.addNewAddress') || 'Add New Address'}
                onPress={handleAddNewAddress}
                buttonStyle={styles.addAddressButton}
                textColor={Colors.primary}
                backgroundColor={Colors.white}
                isBordered={true}
                marginTop={SH(10)}
              />
            )} */}

            {/* Submit Button */}
            <CustomButton
              buttonStyle={styles.submitButton}
              textColor={Colors.textWhite}
              title={t('placeholders.save') || 'Save'}
              onPress={formik.handleSubmit}
              isLoading={formik.isSubmitting}
              marginTop={SH(30)}
            />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAwareScrollView>

      {/* Country Code Modal */}
      <CountryModal
        visible={showCountryModal}
        onClose={() => setShowCountryModal(false)}
        onSelect={(country: any) => {
          formik.setFieldValue('countryCode', country.phoneCode || '+91');
          setShowCountryModal(false);
        }}
        type="country"
        data={countries}
        isLoading={false}
      />
    </Container>
  );
};

export default AddOtherPersonDetail;

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.white,
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
  label: {
    fontSize: SF(14),
    fontFamily: Fonts.MEDIUM,
    marginBottom: SH(7),
    marginTop: SH(15),
    color: Colors.textAppColor,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SW(10),
    marginTop: SH(5),
  },
  countryCodeButton: {
    // CountryCodeSelector handles its own styling
  },
  phoneInput: {
    flex: 1,
  },
  addAddressButton: {
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  submitButton: {
    backgroundColor: Colors.primary,
  },
  errorText: {
    fontSize: SF(12),
    fontFamily: Fonts.REGULAR,
    color: Colors.red,
    marginTop: SH(5),
  },
});
