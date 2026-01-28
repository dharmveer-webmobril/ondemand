import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Keyboard,
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  Pressable,
  // TouchableOpacity,
} from 'react-native';
import {
  AppHeader,
  Container,
  CustomButton,
  CustomInput,
  CustomText,
  // VectoreIcons,
  Checkbox,
  LoadingComp,
  CountryModal,
} from '@components';
import { addAddressSchema, Colors, Fonts, goBack, handleApiError, handleApiFailureResponse, handleSuccessToast, regex, SF, SH, SW } from '@utils';
import { useNavigation, useRoute } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@store/hooks';
import useLocation from '@utils/hooks/useLocation';
import { useFormik } from 'formik';
// import Geocoder from 'react-native-geocoding';
import { 
  // GooglePlacesAutocomplete,
   GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';
import { useAddCustomerAddress, useUpdateCustomerAddress, useGetCities, useGetCountries } from '@services/index';
import { useQueryClient } from '@tanstack/react-query';
// const GOOGLE_MAPS_API_KEY = 'AIzaSyALC5b7touq90VVqX9U96jVMPHjJ5_We8s';

interface FormValues {
  name: string;
  line1: string;
  line2: string;
  landmark: string;
  city: string;
  country: string;
  pincode: string;
  addressType: string;
}

const AddAddress: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { addData, prevScreen = '' } = route.params || {};
  const addressTypes = ['home', 'office', 'other'];
  const [selectedAddressType, setSelectedAddressType] = useState<string>('home');
  const { location, retry } = useLocation();
  console.log('location', location,retry);
  
  const [isDefault, setIsDefault] = useState<boolean>(false);
  const [showCityModal, setShowCityModal] = useState<boolean>(false);
  
  // Determine if city dropdown should be enabled
  const isCityDropdownEnabled = prevScreen === 'my-address';

  const [isLoading, setIsLoading] = useState(false);
  console.log('setIsLoading', setIsLoading);
  const addAddressMutation = useAddCustomerAddress();
  const updateAddressMutation = useUpdateCustomerAddress();
  const queryClient = useQueryClient();

  // Get user details from Redux
  const userDetails = useAppSelector((state) => state.auth.userDetails);
  // const cityId = useAppSelector((state) => state.auth.cityId);
  const cityId = useAppSelector((state) => state.app.userCity)?._id;
  
  const countryId = useAppSelector((state) => state.auth.countryId);

  // Get default city and country from userDetails
  const defaultCityId = useMemo(() => {
    return cityId || userDetails?.city?._id || userDetails?.city || '';
  }, [cityId, userDetails]);

  // Get country from userDetails (stored in Redux)
  const userCountryId = useMemo(() => {
    return userDetails?.country?._id || userDetails?.country || countryId || '';
  }, [userDetails, countryId]);

  const defaultCountryId = useMemo(() => {
    return userCountryId;
  }, [userCountryId]);

  // Extract city and country IDs from addData (handle both string ID and nested object)
  const editCityId = useMemo(() => {
    if (!addData?.city) return '';
    return typeof addData.city === 'string' ? addData.city : addData.city._id;
  }, [addData]);

  const editCountryId = useMemo(() => {
    if (!addData?.country) return '';
    return typeof addData.country === 'string' ? addData.country : addData.country._id;
  }, [addData]);

  // Get countries and cities data - use edit country ID if editing, otherwise use country from userDetails
  const currentCountryId = editCountryId || userCountryId || defaultCountryId;
  const { data: countriesData } = useGetCountries();
  const { data: citiesData, isLoading: citiesLoading } = useGetCities(currentCountryId || null);

  const countries = useMemo(() => countriesData?.ResponseData || [], [countriesData]);
  const cities = useMemo(() => citiesData?.ResponseData || [], [citiesData]);

  // Initialize formik
  const formik = useFormik<FormValues>({
    initialValues: {
      name: addData?.name || '',
      line1: addData?.line1 || '',
      line2: addData?.line2 || '',
      landmark: addData?.landmark || '',
      city: editCityId || defaultCityId,
      country: editCountryId || defaultCountryId,
      pincode: addData?.pincode || '',
      addressType: addData?.addressType || 'home',
    },
    validationSchema: addAddressSchema(t, regex),
    onSubmit: async (values, { setSubmitting }) => {
      Keyboard.dismiss();
      try {
        const data = {
          name: values.name || selectedAddressType.charAt(0).toUpperCase() + selectedAddressType.slice(1),
          line1: values.line1,
          line2: values.line2 || undefined,
          landmark: values.landmark || undefined,
          city: values.city,
          country: values.country,
          pincode: values.pincode,
          addressType: selectedAddressType as 'home' | 'office' | 'other',
        };

        if (prevScreen === 'other_user') {
          // For other user, navigate back with address data
          // Pass data back via navigation params
          navigation.goBack();
          return;
        }

        let response;
        if (addData?._id) {
          // Update existing address
          response = await updateAddressMutation.mutateAsync({
            addressId: addData._id,
            data,
          });
        } else {
          // Add new address
          response = await addAddressMutation.mutateAsync(data);
        }

        // Check response format - API returns { ResponseCode, ResponseMessage, succeeded, ResponseData }
        const apiResponse = response as any;
        const isSuccess =
          apiResponse?.succeeded === true ||
          apiResponse?.ResponseCode === 200 ||
          apiResponse?.ResponseCode === 201;

        if (isSuccess) {
          // Invalidate and refetch addresses
          queryClient.invalidateQueries({ queryKey: ['customerAddresses'] });
          const successMessage =
            apiResponse?.ResponseMessage ||
            (addData?._id ? t("addAddress.editAddaddressSuccess") : t("addAddress.addaddressSuccess"));
          handleSuccessToast(successMessage);
          goBack();
        } else {
          handleApiFailureResponse(apiResponse, '');
        }
      } catch (error) {
        handleApiError(error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Get city and country names for display (after formik is declared)
  const cityName = useMemo(() => {
    if (!formik.values.city) return '';
    const foundCity = cities.find((c: any) => c._id === formik.values.city);
    return foundCity?.name || '';
  }, [formik.values.city, cities]);

  const countryName = useMemo(() => {
    if (!formik.values.country) return '';
    const foundCountry = countries.find((c: any) => c._id === formik.values.country);
    return foundCountry?.name || '';
  }, [formik.values.country, countries]);

  // Handle city selection (receives city object from CountryModal)
  const handleCitySelect = (city: any) => {
    formik.setFieldValue('city', city._id);
    formik.setFieldTouched('city', true);
    setShowCityModal(false);
  };

  useEffect(() => {
    if (addData) {
      setSelectedAddressType(addData.addressType || 'home');
      setIsDefault(!!addData?.isDefault);

      // Extract IDs from nested objects if they exist
      const cityIdValue = typeof addData.city === 'string' ? addData.city : addData.city?._id || defaultCityId;
      const countryIdValue = typeof addData.country === 'string' ? addData.country : addData.country?._id || defaultCountryId;

      formik.setValues({
        name: addData.name || '',
        line1: addData.line1 || '',
        line2: addData.line2 || '',
        landmark: addData.landmark || '',
        city: cityIdValue,
        country: countryIdValue,
        pincode: addData.pincode || '',
        addressType: addData.addressType || 'home',
      });
      placesRef?.current?.setAddressText(addData.line1 || '');
    } else {
      // Set defaults from userDetails for new address
      formik.setValues({
        name: '',
        line1: '',
        line2: '',
        landmark: '',
        city: defaultCityId,
        country: defaultCountryId,
        pincode: '',
        addressType: 'home',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addData, defaultCityId, defaultCountryId, editCityId, editCountryId]);

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

  // const handleUseCurrentLocation = async () => {
  //   if (!location) {
  //     retry();
  //     return;
  //   }
  //   setIsLoading(true)
  //   try {
  //     const response = await Geocoder.from(location.latitude, location.longitude);
  //     console.log('Geocoder response:', response);

  //     if (response.results.length > 0) {
  //       const result = response.results[0];
  //       const components = result.address_components;

  //       const getComp = (types: string[]) => components.find((c: any) => types.every((type) => c.types.includes(type)))?.long_name || "";

  //       const street = getComp(["route"]);
  //       const geocodedCityName = getComp(["locality"]) || getComp(["administrative_area_level_2"]);
  //       const postalCode = getComp(["postal_code"]);

  //       // Find city ID from cities data if city name matches
  //       const foundCity = citiesData?.ResponseData?.find((c: any) =>
  //         c.name?.toLowerCase() === geocodedCityName?.toLowerCase()
  //       );

  //       formik.setValues({
  //         ...formik.values,
  //         line1: result?.formatted_address || street,
  //         // Don't set landmark from state - landmark is for nearby places, not state
  //         city: foundCity?._id || defaultCityId,
  //         pincode: postalCode || '',
  //       });
  //       placesRef?.current?.setAddressText(result?.formatted_address || street);
  //       setIsLoading(false)
  //     }
  //   } catch (err) {
  //     console.error("Geocoding error:", err);
  //     setIsLoading(false)
  //     handleApiError(err);
  //   }
  // };

  return (
    <Container safeArea={true}>
      <LoadingComp visible={isLoading} />

      <AppHeader
        title={addData?._id ? t('addAddress.edittitle') : t('addAddress.title')}
        onLeftPress={() => navigation.goBack()}
        containerStyle={styles.header}
      />
      {/* <AppHeader
        title={addData?._id ? t('addAddress.edittitle') : t('addAddress.title')}
        onLeftPress={() => navigation.goBack()}
        leftIconName="arrowleft"
        containerStyle={styles.header}
      /> */}
     <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
        enableOnAndroid={false}
        extraScrollHeight={100}
        keyboardShouldPersistTaps="handled"
        enableResetScrollToCoords={false}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            {/* <TouchableOpacity onPress={handleUseCurrentLocation} style={styles.locationRow}>
              <CustomText style={styles.locationText}>
                <VectoreIcons size={SF(14)} color={Colors.primary} icon='FontAwesome6' name='location-dot' /> {t('addAddress.useMyCurrentLocation')}
              </CustomText>
              <VectoreIcons size={SF(26)} color={Colors.primary} icon='Feather' name='chevron-right' />
            </TouchableOpacity> */}
            {/* Name Field */}
            <CustomText style={styles.label}>{t('addAddress.placeholders.name') || 'Address Name'}</CustomText>
            <CustomInput
              placeholder={t('addAddress.placeholders.name') || 'Address Name'}
              value={formik.values.name}
              onChangeText={(val: string) => {
                formik.setFieldValue('name', val);
              }}
              onBlur={() => formik.setFieldTouched('name', true)}
              errortext={formik.touched.name && formik.errors.name ? formik.errors.name : ''}
              keyboardType="default"
              maxLength={50}
              marginTop={SH(5)}
            />

            <CustomText style={styles.addressTypeLabel}>{t('addAddress.placeholders.streetAddress') || 'Street Address'}</CustomText>
            <CustomInput
              placeholder={t('addAddress.placeholders.streetAddress') || 'Street Address'}
              value={formik.values.line1}
              onChangeText={(val: string) => formik.setFieldValue('line1', val)}
              onBlur={() => formik.setFieldTouched('line1', true)}
              errortext={formik.touched.line1 && formik.errors.line1 ? formik.errors.line1 : ''}
              keyboardType="default"
              maxLength={80}
              marginTop={SH(5)}
            />
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
            {/* <GooglePlacesAutocomplete
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
                const geocodedCityName = components.find((c) => c.types.includes('locality'))?.long_name;
                const postalCode = components.find((c) => c.types.includes('postal_code'))?.long_name;

                // Find city ID from cities data if city name matches
                const foundCity = citiesData?.ResponseData?.find((c: any) =>
                  c.name?.toLowerCase() === geocodedCityName?.toLowerCase()
                );

                formik.setFieldValue('line1', data.description);
                // Don't set landmark from state - landmark is for nearby places, not state
                // User will manually enter landmark if needed
                formik.setFieldValue('city', foundCity?._id || defaultCityId);
                formik.setFieldValue('pincode', postalCode || '');
                setTimeout(() => {
                  formik.setFieldTouched('city', true);
                  formik.validateField('city');
                  formik.setFieldTouched('line1', true);
                  formik.validateField('line1');
                  formik.setFieldTouched('pincode', true);
                  formik.validateField('pincode');
                }, 100);
                console.log('✅ Latitude:', lat);
                console.log('✅ Longitude:', lng);
                console.log('🏙️ City:', geocodedCityName, 'ID:', foundCity?._id);
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
            {formik.touched.line1 && formik.errors.line1 && (
              <CustomText style={styles.errorText}>{formik.errors.line1}</CustomText>
            )} */}
            <CustomText style={styles.label}>{t('addAddress.placeholders.apartment') || 'Line 2 (Optional)'}</CustomText>
            <CustomInput
              placeholder={t('addAddress.placeholders.apartment') || 'Line 2 (Optional)'}
              value={formik.values.line2}
              onChangeText={(val: string) => formik.setFieldValue('line2', val)}
              onBlur={() => formik.setFieldTouched('line2', true)}
              errortext={formik.touched.line2 && formik.errors.line2 ? formik.errors.line2 : ''}
              keyboardType="default"
              maxLength={80}
              marginTop={SH(5)}
            />
            <CustomText style={styles.label}>{t('addAddress.placeholders.landmark') || 'Landmark (Optional)'}</CustomText>
            <CustomInput
              placeholder={t('addAddress.placeholders.landmark') || 'e.g., Near ABC Shop, Behind XYZ Mall'}
              value={formik.values.landmark}
              onChangeText={(val: string) => formik.setFieldValue('landmark', val)}
              onBlur={() => formik.setFieldTouched('landmark', true)}
              errortext={formik.touched.landmark && formik.errors.landmark ? formik.errors.landmark : ''}
              keyboardType="default"
              maxLength={80}
              marginTop={SH(5)}
            />
            {/* <CustomText style={styles.label}>{t('addAddress.placeholders.contact') || 'Contact Number'}</CustomText>
            <CustomInput
              placeholder={t('addAddress.placeholders.contact') || 'Contact Number'}
              value={formik.values.contact}
              onChangeText={(val: string) => formik.setFieldValue('contact', val)}
              onBlur={() => formik.setFieldTouched('contact', true)}
              errortext={formik.touched.contact && formik.errors.contact ? formik.errors.contact : ''}
              keyboardType="phone-pad"
              maxLength={15}
              marginTop={SH(5)}
            /> */}

            <CustomText style={styles.label}>{t('addAddress.placeholders.country') || 'Country'}</CustomText>
            <CustomInput
              placeholder={t('addAddress.placeholders.country') || 'Country'}
              value={countryName}
              onChangeText={() => { }} // Read-only, display only
              onBlur={() => formik.setFieldTouched('country', true)}
              errortext={formik.touched.country && formik.errors.country ? formik.errors.country : ''}
              keyboardType="default"
              maxLength={50}
              isEditable={false}
              marginTop={SH(5)}
            />
            {formik.touched.country && formik.errors.country && (
              <CustomText style={styles.errorText}>{formik.errors.country}</CustomText>
            )}
            <CustomText style={styles.label}>{t('addAddress.placeholders.city') || 'City'}</CustomText>
            <Pressable
              onPress={() => {
                if (isCityDropdownEnabled) {
                  setShowCityModal(true);
                }
              }}
              disabled={!isCityDropdownEnabled}
            >
              <CustomInput
                placeholder={t('addAddress.placeholders.city') || 'City'}
                value={cityName}
                onChangeText={() => { }} // Read-only, display only
                onBlur={() => formik.setFieldTouched('city', true)}
                errortext={formik.touched.city && formik.errors.city ? formik.errors.city : ''}
                keyboardType="default"
                maxLength={50}
                isEditable={false}
                marginTop={SH(5)}
              />
            </Pressable>
            {formik.touched.city && formik.errors.city && (
              <CustomText style={styles.errorText}>{formik.errors.city}</CustomText>
            )}
            <CustomText style={styles.label}>{t('addAddress.placeholders.zipCode') || 'Pincode'}</CustomText>
            <CustomInput
              placeholder={t('addAddress.placeholders.zipCode') || 'Pincode'}
              value={formik.values.pincode}
              onChangeText={(val: string) => formik.setFieldValue('pincode', val)}
              onBlur={() => formik.setFieldTouched('pincode', true)}
              errortext={formik.touched.pincode && formik.errors.pincode ? formik.errors.pincode : ''}
              keyboardType="numeric"
              maxLength={12}
              marginTop={SH(5)}
            />
            {
              prevScreen !== 'other_user' &&
              <>

                <CustomText style={styles.addressTypeLabel}>{t('addAddress.placeholders.addressType') || 'Address Type'}</CustomText>
                <View style={styles.addressTypeContainer}>
                  {addressTypes.map((type) => (
                    <Checkbox
                      key={type}
                      checked={selectedAddressType === type}
                      onChange={() => {
                        setSelectedAddressType(type);
                        formik.setFieldValue('addressType', type);
                        // Auto-fill name if empty
                        if (!formik.values.name) {
                          formik.setFieldValue('name', type.charAt(0).toUpperCase() + type.slice(1));
                        }
                        formik.setFieldTouched('addressType', true);
                      }}
                      size={SF(14)}
                      label={type.charAt(0).toUpperCase() + type.slice(1)}
                    />
                  ))}
                </View>
                {formik.touched.addressType && formik.errors.addressType && (
                  <CustomText style={styles.errorText}>{formik.errors.addressType}</CustomText>
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
            <CustomButton
              buttonStyle={styles.submitButton}
              textColor={Colors.textWhite}
              title={t('addAddress.placeholders.save')}
              onPress={formik.handleSubmit}
              isLoading={addAddressMutation.isPending || updateAddressMutation.isPending || formik.isSubmitting}
            />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAwareScrollView>
      <CountryModal
        type="city"
        data={cities || []}
        visible={showCityModal}
        onClose={() => setShowCityModal(false)}
        onSelect={handleCitySelect}
        selectedId={formik.values.city || null}
        isLoading={citiesLoading}
      />
    </Container>
  );
};

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
    flex: 1,
  },
  input: {
    borderColor: Colors.textAppColor,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderRadius: 6,
    padding: SH(10),
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
    color: Colors.primary,
    fontFamily: Fonts.SEMI_BOLD,
  },
  submitButton: {
    backgroundColor: Colors.primary,
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
  label: {
    fontSize: SF(14),
    fontFamily: Fonts.MEDIUM,
    marginBottom: SH(7),
    marginTop: SH(15),
    color: Colors.textAppColor,
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