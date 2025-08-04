import React, { useState, useEffect } from 'react';
import {
  Keyboard,
  StyleSheet,
  View,
} from 'react-native';
import {
  AppHeader,
  Container,
  Buttons,
  InputField,
  AppText,
  VectoreIcons,
  Checkbox,
} from '../../component';
import { addAddressSchema, Colors, Fonts, goBack, handleApiError, handleApiFailureResponse, handleSuccessToast, regex, SF, SH, SW } from '../../utils';
import { useNavigation, useRoute } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useSubmitAddressMutation, useUpdateAddressMutation } from '../../redux';

const AddAddress = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { addData } = route.params || {};
  const addressTypes = ['Other', 'Home', 'Office', 'Apartment'];
  const [selectedAddressType, setSelectedAddressType] = useState<string>('Other');
  const [isDefault, setIsDefault] = useState<boolean>(false);

  // Prefill initial values with addData if editing
  const initialValues = {
    address: addData?.streetAddress || '',
    appartment: addData?.apartment || '',
    city: addData?.city || '',
    zipCode: addData?.zip || '',
    state: addData?.state || '',
    addressType: addData?.type || 'Other', // Prefill with existing type
  };

  useEffect(() => {
    if (addData) {
      setSelectedAddressType(addData.type || 'Other');
      setIsDefault(!!addData?.isDefault); // Convert to boolean
    }
  }, [addData]);

  const [submitAddress, { isLoading: isSubmitLoading }] = useSubmitAddressMutation();
  const [updateAddress, { isLoading: isUpdateLoading }] = useUpdateAddressMutation();

  const onSubmit = async (values: typeof initialValues) => {
    Keyboard.dismiss();
    let data: any = {
      type: selectedAddressType,
      streetAddress: values.address,
      apartment: values.appartment,
      city: values.city,
      state: values.state,
      zip: values.zipCode,
      country: 'NA',
      isDefault,
      location: {
        coordinates: [72.8777, 19.0760], // [longitude, latitude]
      },
    };
    console.log(data, '------data');

    try {
      let response;
      if (addData?._id) {
        data.id = addData._id;
        // Edit mode: use update mutation with _id
        response = await updateAddress({ data }).unwrap();
      } else {
        // Add mode: use submit mutation
        response = await submitAddress({ data }).unwrap();
      }
      console.log('res', response);
      if (response.success) {
        handleSuccessToast(response.message || (addData?._id ? t("addAddress.editAddaddressSuccess") : t("addAddress.addaddressSuccess")));
        goBack();
      } else {
        handleApiFailureResponse(response, '');
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  return (
    <Container isPadding={false}>
      <AppHeader
        headerTitle={addData?._id ? t('addAddress.edittitle'):t('addAddress.title')}
        onPress={() => navigation.goBack()}
        Iconname="arrowleft"
        headerStyle={styles.header}
      />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        extraScrollHeight={SH(40)}
      >
        <View style={styles.container}>
          <View style={styles.locationRow}>
            <AppText style={styles.locationText}>
              <VectoreIcons size={SF(14)} color={Colors.themeColor} icon='FontAwesome6' name='location-dot' /> {t('addAddress.useMyCurrentLocation')}
            </AppText>
            <VectoreIcons size={SF(26)} color={Colors.themeColor} icon='Feather' name='chevron-right' />
          </View>
          <Formik
            initialValues={initialValues}
            validationSchema={addAddressSchema(t, regex)}
            onSubmit={onSubmit}
          >
            {({
              handleChange,
              handleBlur,
              values,
              errors,
              touched,
              handleSubmit,
              setFieldValue,
            }) => (
              <>
                <InputField
                  label={t('addAddress.placeholders.streetAddress')}
                  value={values.address}
                  onChangeText={handleChange('address')}
                  onBlur={handleBlur('address')}
                  errorMessage={touched.address && errors.address ? String(errors.address) : ''}
                  keyboardType="default"
                  inputStyle={styles.inputFieldStyle}
                  color={Colors.textAppColor}
                  textColor={Colors.textAppColor}
                />
                <InputField
                  label={t('addAddress.placeholders.apartment')}
                  value={values.appartment}
                  onChangeText={handleChange('appartment')}
                  onBlur={handleBlur('appartment')}
                  inputStyle={styles.inputFieldStyle}
                  errorMessage={touched.appartment && errors.appartment ? String(errors.appartment) : ''}
                  keyboardType="default"
                  color={Colors.textAppColor}
                  textColor={Colors.textAppColor}
                />
                <View style={styles.rowContainer}>
                  <View style={styles.halfWidth}>
                    <InputField
                      label={t('addAddress.placeholders.city')}
                      value={values.city}
                      onChangeText={handleChange('city')}
                      inputStyle={styles.inputFieldStyle}
                      onBlur={handleBlur('city')}
                      errorMessage={touched.city && errors.city ? String(errors.city) : ''}
                      keyboardType="default"
                      color={Colors.textAppColor}
                      textColor={Colors.textAppColor}
                    />
                  </View>
                  <View style={styles.halfWidth}>
                    <InputField
                      label={t('addAddress.placeholders.state')}
                      value={values.state}
                      inputStyle={styles.inputFieldStyle}
                      onChangeText={handleChange('state')}
                      onBlur={handleBlur('state')}
                      errorMessage={touched.state && errors.state ? String(errors.state) : ''}
                      keyboardType="default"
                      color={Colors.textAppColor}
                      textColor={Colors.textAppColor}
                    />
                  </View>
                </View>
                <InputField
                  label={t('addAddress.placeholders.zipCode')}
                  value={values.zipCode}
                  onChangeText={handleChange('zipCode')}
                  onBlur={handleBlur('zipCode')}
                  errorMessage={touched.zipCode && errors.zipCode ? String(errors.zipCode) : ''}
                  keyboardType="default"
                  color={Colors.textAppColor}
                  inputStyle={styles.inputFieldStyle}
                  textColor={Colors.textAppColor}
                />
                <AppText style={styles.addressTypeLabel}>{t('addAddress.placeholders.addressType')}</AppText>
                <View style={styles.addressTypeContainer}>
                  {addressTypes.map((type) => (
                    <Checkbox
                      key={type}
                      checked={selectedAddressType === type}
                      onChange={() => {
                        setSelectedAddressType(type);
                        setFieldValue('addressType', type);
                      }}
                      size={SF(14)}
                      label={type}
                    />
                  ))}
                </View>
                <View style={styles.checkboxContainer}>
                  <Checkbox
                    checked={isDefault}
                    onChange={() => setIsDefault(!isDefault)} // Toggle state
                    size={SF(14)}
                    label={t('addAddress.makeThisDefault')}
                  />
                </View>
                <Buttons
                  buttonStyle={styles.submitButton}
                  textColor={Colors.textWhite}
                  title={t('addAddress.placeholders.save')}
                  onPress={handleSubmit}
                  isLoading={isSubmitLoading || isUpdateLoading} // Combine loading states
                />
              </>
            )}
          </Formik>
        </View>
      </KeyboardAwareScrollView>
    </Container>
  );
};

export default AddAddress;

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
    flex: 1,
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
    marginTop: SH(4),
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
    marginTop: SH(30),
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationText: {
    color: Colors.themeColor,
    fontFamily: Fonts.SEMI_BOLD,
  },
  bottomContainer: {
    paddingHorizontal: SW(25),
    paddingVertical: SH(20),
  },
  checkboxContainer: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 10,
    backgroundColor: '#F2F2F2',
    padding: 8,
    borderRadius: 10,
    paddingLeft: SW(15),
  },
  addressTypeLabel: {
    fontSize: SF(14),
    fontFamily: Fonts.MEDIUM,
    marginBottom: SH(10),
    color: Colors.textAppColor,
    marginTop: 10,
  },
  addressTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SW(3),
    marginBottom: SH(10),
  },
  inputFieldStyle: {
    paddingVertical: 4,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
});