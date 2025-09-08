import React, { useState, useEffect, useRef } from 'react';
import {
  Keyboard,
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from 'react-native';
import {
  AppHeader,
  Container,
  Buttons,
  InputField,
  AppText,
  VectoreIcons,
  Checkbox,
  LoadingComponent,
} from '../../component';
import { addAddressSchema, Colors, Fonts, goBack, handleApiError, handleApiFailureResponse, handleSuccessToast, regex, SF, SH, SW } from '../../utils';
import { useNavigation, useRoute } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useTranslation } from 'react-i18next';
import { setOtherUserAddress, useSubmitAddressMutation, useUpdateAddressMutation } from '../../redux';
import AddressSearch, { ParsedAddress } from './AddressSearch';
import { useDispatch } from 'react-redux';
import useLocation from '../../utils/hooks/useLocation';
import { useFormik } from 'formik';
import Geocoder from 'react-native-geocoding';
import { GooglePlacesAutocomplete, GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';
const GOOGLE_MAPS_API_KEY = 'AIzaSyALC5b7touq90VVqX9U96jVMPHjJ5_We8s';
interface FormValues {
  address: string;
  appartment: string;
  city: string;
  zipCode: string;
  state: string;
  addressType: string;
  location: { coordinates: [number, number] };
}

const AddAddress: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { addData, prevScreen = '' } = route.params || {};
  const addressTypes = ['Other', 'Home', 'Office', 'Apartment'];
  const [selectedAddressType, setSelectedAddressType] = useState<string>('Other');
  const { location, retry, isLoading: isLocationLoading } = useLocation();
  const [isDefault, setIsDefault] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState(false)
  const [submitAddress, { isLoading: isSubmitLoading }] = useSubmitAddressMutation();
  const [updateAddress, { isLoading: isUpdateLoading }] = useUpdateAddressMutation();
  const dispatch = useDispatch();

  // Initialize formik
  const formik = useFormik<FormValues>({
    initialValues: {
      address: addData?.streetAddress || '',
      appartment: addData?.apartment || '',
      city: addData?.city || '',
      zipCode: addData?.zip || '',
      state: addData?.state || '',
      addressType: addData?.type || 'Other',
      location: addData?.location || { coordinates: [0, 0] },
    },
    validationSchema: addAddressSchema(t, regex),
    onSubmit: async (values, { setSubmitting }) => {
      Keyboard.dismiss();
      try {
        const data: any = {
          type: selectedAddressType,
          streetAddress: values.address,
          apartment: values.appartment,
          city: values.city,
          state: values.state,
          zip: values.zipCode,
          country: 'NA',
          isDefault,
          location: values.location,
        };

        if (prevScreen === 'other_user') {
          dispatch(setOtherUserAddress(data));
          goBack();
          return;
        }

        let response;
        if (addData?._id) {
          data.id = addData._id;
          response = await updateAddress({ data }).unwrap();
        } else {
          response = await submitAddress({ data }).unwrap();
        }

        if (response.success) {
          handleSuccessToast(response.message || (addData?._id ? t("addAddress.editAddaddressSuccess") : t("addAddress.addaddressSuccess")));
          goBack();
        } else {
          handleApiFailureResponse(response, '');
        }
      } catch (error) {
        handleApiError(error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (addData) {
      setSelectedAddressType(addData.type || 'Other');
      setIsDefault(!!addData?.isDefault);
      formik.setValues({
        address: addData.streetAddress || '',
        appartment: addData.apartment || '',
        city: addData.city || '',
        zipCode: addData.zip || '',
        state: addData.state || '',
        addressType: addData.type || 'Other',
        location: addData.location || { coordinates: [0, 0] },
      });
    }
  }, [addData]);

  // const handleUseCurrentLocation = async () => {
  //   if (!location) {
  //     retry();
  //     return;
  //   }

  //   try {
  //     const response = await Geocoder.from(location.latitude, location.longitude);
  //     console.log('Geocoder response:', response);

  //     if (response.results.length > 0) {
  //       const result = response.results[0];
  //       const components = result.address_components;

  //       const getComp = (types: string[]) => components.find((c: any) => types.every(t => c.types.includes(t)))?.long_name || "";

  //       console.log('Parsed address components:', components);

  //       const street = getComp(["route"]);
  //       const city = getComp(["locality"]) || getComp(["administrative_area_level_2"]);
  //       const state = getComp(["administrative_area_level_1"]);
  //       const postalCode = getComp(["postal_code"]);

  //       formik.setValues({
  //         ...formik.values,
  //         address: result.formatted_address || street,
  //         city,
  //         state,
  //         zipCode: postalCode,
  //         location: { coordinates: [location.latitude, location.longitude] },
  //       });
  //     }
  //   } catch (err) {
  //     console.error("Geocoding error:", err);
  //     handleApiError(err);
  //   }
  // };

  const placesRef = useRef<GooglePlacesAutocompleteRef>(null);
  useEffect(() => {
    placesRef?.current?.setAddressText(addData?.streetAddress || '');
  }, []);

  const handleUseCurrentLocation = async () => {
    if (!location) {
      retry();
      return;
    }
    setIsLoading(true)
    try {
      const response = await Geocoder.from(location.latitude, location.longitude);
      console.log('Geocoder response:', response);

      if (response.results.length > 0) {
        const result = response.results[0];
        const components = result.address_components;

        const getComp = (types: string[]) => components.find((c: any) => types.every(t => c.types.includes(t)))?.long_name || "";

        console.log('Parsed address components:', components);

        const street = getComp(["route"]);
        const city = getComp(["locality"]) || getComp(["administrative_area_level_2"]);
        const state = getComp(["administrative_area_level_1"]);
        const postalCode = getComp(["postal_code"]);
        console.log('result.formatted_address', result.formatted_address);

        formik.setValues({
          ...formik.values,
          address: result?.formatted_address || street,
          city,
          state,
          // landmark: street,
          zipCode: postalCode,
          location: { coordinates: [location.latitude, location.longitude] },
        });
        placesRef?.current?.setAddressText(result?.formatted_address || street);
        setIsLoading(false)
      }
    } catch (err) {
      console.error("Geocoding error:", err);
      setIsLoading(false)
      handleApiError(err);
    }
  };

  return (
    <Container isPadding={false}>
      <LoadingComponent visible={isLoading || isSubmitLoading || isUpdateLoading || formik.isSubmitting || isLocationLoading} />
      <AppHeader
        headerTitle={addData?._id ? t('addAddress.edittitle') : t('addAddress.title')}
        onPress={() => navigation.goBack()}
        Iconname="arrowleft"
        headerStyle={styles.header}
      />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        extraScrollHeight={SH(40)}
        keyboardShouldPersistTaps='handled'
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <TouchableOpacity onPress={handleUseCurrentLocation} style={styles.locationRow}>
              <AppText style={styles.locationText}>
                <VectoreIcons size={SF(14)} color={Colors.themeColor} icon='FontAwesome6' name='location-dot' /> {t('addAddress.useMyCurrentLocation')}
              </AppText>
              <VectoreIcons size={SF(26)} color={Colors.themeColor} icon='Feather' name='chevron-right' />
            </TouchableOpacity>
            <AppText style={styles.addressTypeLabel}>{t('addAddress.placeholders.streetAddress')}</AppText>
            {/* <AddressSearch
              inputStyle={{ borderColor: Colors.textAppColor, height: SF(45), borderWidth: 1, color: Colors.textAppColor, marginTop: SH(10), paddingVertical: 4 }}
              placeholderTextColor={Colors.textAppColor}
              countryCode="in"
              value={formik.values.address}
              placeholder={""}
              onSelect={(parsed: ParsedAddress) => {
                formik.setValues({
                  ...formik.values,
                  address: parsed.formattedAddress,
                  city: parsed.city,
                  state: parsed.state,
                  zipCode: parsed.postalCode,
                  appartment: '',
                  location: { coordinates: [parsed.lng, parsed.lat] },
                });
                formik.setFieldTouched('address', true);
                formik.setFieldTouched('city', true);
                formik.setFieldTouched('state', true);
                formik.setFieldTouched('zipCode', true);
              }}
            /> */}
            <GooglePlacesAutocomplete
              ref={placesRef}
              placeholder="Search"
              fetchDetails={true}
              keyboardShouldPersistTaps="handled"
              onPress={(data: any, details: any = null) => {
                if (!details) {
                  console.log('❌ No details found');
                  return;
                }

                console.log('📍 Full Data:', data);
                console.log('📍 Details:', details);

                // Extract lat/lng
                const { lat, lng } = details.geometry.location;

                // Extract address components
                const components: any[] = details.address_components || [];
                const city = components.find((c) => c.types.includes('locality'))?.long_name;
                const state = components.find((c) =>
                  c.types.includes('administrative_area_level_1')
                )?.long_name;
                const postalCode = components.find((c) => c.types.includes('postal_code'))?.long_name;

                formik.setFieldValue('address', data.description);
                formik.setFieldValue('city', city || '');
                formik.setFieldValue('state', state || '');
                formik.setFieldValue('zipCode', postalCode || '');
                formik.setFieldValue('location', { coordinates: [lat.toString(), lng.toString()] });

                // formik.setFieldValue('lat', lat.toString());
                // formik.setFieldValue('lng', lng.toString());
                console.log('✅ Latitude:', lat);
                console.log('✅ Longitude:', lng);
                console.log('🏙️ City:', city);
                console.log('🌎 State:', state);
                console.log('📮 Postal Code:', postalCode);
              }}
              query={{
                key: GOOGLE_MAPS_API_KEY,
                language: 'en',
              }}
              GooglePlacesDetailsQuery={{
                fields: 'geometry,address_components',
              }}
              onFail={(error: any) => console.error('❌ API Error:', error)}
              onNotFound={() => console.log('⚠️ No results found')}
              styles={{
                textInput: styles.input,
                container: styles.autocompleteContainer,
                listView: {
                  backgroundColor: 'white',
                  position: 'absolute',
                  zIndex: 999,
                  width: '100%',
                  top: SH(58),
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                  borderRadius: 5,
                },
                separator: {
                  height: 0.5,
                  backgroundColor: 'gray',
                },
              }}
              debounce={200}
              timeout={20000}
              minLength={3}
              predefinedPlaces={[]}


              textInputProps={{
                onFocus: () => console.log('✏️ Input Focused'),
                onBlur: () => {
                  console.warn('Blur');
                },
                // defaultValue: initialAddress,
              }}
            />
            {formik.touched.address && formik.errors.address && (
              <AppText style={styles.errorText}>{formik.errors.address}</AppText>
            )}
            <InputField
              label={t('addAddress.placeholders.apartment')}
              value={formik.values.appartment}
              onChangeText={(val) => formik.setFieldValue('appartment', val)}
              onBlur={() => formik.setFieldTouched('appartment', true)}
              inputStyle={styles.inputFieldStyle}
              errorMessage={formik.touched.appartment && formik.errors.appartment ? formik.errors.appartment : ''}
              keyboardType="default"
              color={Colors.textAppColor}
              textColor={Colors.textAppColor}
            />
            <View style={styles.rowContainer}>
              <View style={styles.halfWidth}>
                <InputField
                  label={t('addAddress.placeholders.city')}
                  value={formik.values.city}
                  onChangeText={(val) => formik.setFieldValue('city', val)}
                  onBlur={() => formik.setFieldTouched('city', true)}
                  inputStyle={styles.inputFieldStyle}
                  errorMessage={formik.touched.city && formik.errors.city ? formik.errors.city : ''}
                  keyboardType="default"
                  color={Colors.textAppColor}
                  textColor={Colors.textAppColor}
                />
              </View>
              <View style={styles.halfWidth}>
                <InputField
                  label={t('addAddress.placeholders.state')}
                  value={formik.values.state}
                  onChangeText={(val) => formik.setFieldValue('state', val)}
                  onBlur={() => formik.setFieldTouched('state', true)}
                  inputStyle={styles.inputFieldStyle}
                  errorMessage={formik.touched.state && formik.errors.state ? formik.errors.state : ''}
                  keyboardType="default"
                  color={Colors.textAppColor}
                  textColor={Colors.textAppColor}
                />
              </View>
            </View>
            <InputField
              label={t('addAddress.placeholders.zipCode')}
              value={formik.values.zipCode}
              onChangeText={(val) => formik.setFieldValue('zipCode', val)}
              onBlur={() => formik.setFieldTouched('zipCode', true)}
              errorMessage={formik.touched.zipCode && formik.errors.zipCode ? formik.errors.zipCode : ''}
              keyboardType="default"
              color={Colors.textAppColor}
              inputStyle={styles.inputFieldStyle}
              textColor={Colors.textAppColor}
            />
            {
              prevScreen !== 'other_user' &&
              <>

                <AppText style={styles.addressTypeLabel}>{t('addAddress.placeholders.addressType')}</AppText>
                <View style={styles.addressTypeContainer}>
                  {addressTypes.map((type) => (
                    <Checkbox
                      key={type}
                      checked={selectedAddressType === type}
                      onChange={() => {
                        setSelectedAddressType(type);
                        formik.setFieldValue('addressType', type);
                        formik.setFieldTouched('addressType', true);
                      }}
                      size={SF(14)}
                      label={t(`addAddress.addressTypes.${type.toLowerCase()}`)}
                    />
                  ))}
                </View>
                {formik.touched.addressType && formik.errors.addressType && (
                  <AppText style={styles.errorText}>{formik.errors.addressType}</AppText>
                )}
                <View style={styles.checkboxContainer}>
                  <Checkbox
                    checked={isDefault}
                    onChange={() => setIsDefault(!isDefault)}
                    size={SF(14)}
                    label={t('addAddress.makeThisDefault')}
                  />
                </View>
              </>
            }
            <Buttons
              buttonStyle={styles.submitButton}
              textColor={Colors.textWhite}
              title={t('addAddress.placeholders.save')}
              onPress={formik.handleSubmit}
            // isLoading={isSubmitLoading || isUpdateLoading || formik.isSubmitting || isLocationLoading}
            />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAwareScrollView>
    </Container>
  );
};

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
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginVertical: 5,
  },
  error: {
    color: Colors.red,
    fontSize: 12,
    marginBottom: 5,
    marginLeft: 5,
  },
  autocompleteContainer: { flex: 0 },
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
  submitButton: {
    backgroundColor: Colors.themeColor,
    marginTop: SH(30),
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
  errorText: {
    fontSize: SF(12),
    color: Colors.red,
    marginTop: SH(5),
    fontFamily: Fonts.REGULAR,
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
});

export default AddAddress;