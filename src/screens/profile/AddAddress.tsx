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
  // Checkbox,
  LoadingComp,
  CountryModal,
  showToast,
} from '@components';
import { addAddressSchema, Colors, Fonts, goBack, handleApiError, handleApiFailureResponse, handleSuccessToast, regex, SF, SH, SW } from '@utils';
import { useNavigation, useRoute } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@store/hooks';
import { useFormik } from 'formik';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geocoder from 'react-native-geocoding';
import {
  // GooglePlacesAutocomplete,
  GooglePlacesAutocompleteRef
} from 'react-native-google-places-autocomplete';
import { useAddCustomerAddress, useUpdateCustomerAddress, useGetCities, useGetCountries } from '@services/index';
import { useQueryClient } from '@tanstack/react-query';
import useCurrentLocation from '@utils/hooks/useLocation';

const GOOGLE_MAPS_API_KEY = 'AIzaSyALC5b7touq90VVqX9U96jVMPHjJ5_We8s';
Geocoder.init(GOOGLE_MAPS_API_KEY);
interface FormValues {
  name: string;
  line1: string;
  line2: string;
  landmark: string;
  city: string;
  country: string;
  pincode: string;
  addressType: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

const AddAddress: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { addData, prevScreen = '' } = route.params || {};
  // const addressTypes = ['home', 'office', 'other'];
  const [selectedAddressType, setSelectedAddressType] = useState<string>('home');

  const [_, setIsDefault] = useState<boolean>(false);
  const [showCityModal, setShowCityModal] = useState<boolean>(false);

  // Determine if city dropdown should be enabled
  const isCityDropdownEnabled = prevScreen === 'my-address';

  const addAddressMutation = useAddCustomerAddress();
  const updateAddressMutation = useUpdateCustomerAddress();
  const queryClient = useQueryClient();

  // Get user details from Redux
  const userDetails = useAppSelector((state) => state.auth.userDetails);
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
      coordinates: addData?.coordinates ? {
        lat: addData?.coordinates?.lat,
        lng: addData?.coordinates?.lng,
      } : undefined,
    },
    validationSchema: addAddressSchema(t, regex),
    onSubmit: async (values, { setSubmitting }) => {
      if (!values.coordinates) {
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Please select a location on the map',
        });
        return;
      }
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
          ...(values.coordinates && { coordinates: values.coordinates })
        };
        console.log('payload----', data);
        if (prevScreen === 'other_user') {
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
          apiResponse?.succeeded === true || apiResponse?.ResponseCode === 200 || apiResponse?.ResponseCode === 201;

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


  const placesRef = useRef<GooglePlacesAutocompleteRef>(null);



  //mapppps and location ========================
  const [region, setRegion] = useState({
    latitude: 22.7196,
    longitude: 75.8577,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });


  const { hasPermission, location, loading: locationLoading, error: locationError, retry } = useCurrentLocation();
  useEffect(() => {
    retry(); // call once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (location) {
      setRegion({
        ...region,
        latitude: addData?.coordinates?.lat || location.latitude,
        longitude: addData?.coordinates?.lng || location.longitude,
      });
      if (!addData) {
        getAddress(location.latitude, location.longitude);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);
  console.log('location', location, hasPermission, locationError);
  console.log('addData', addData);
  // const handleDragEnd = (e: any) => {
  //   console.log('handleDragEnd', e);
  //   const { latitude, longitude } = e.nativeEvent.coordinate;
  //   setRegion({
  //     ...region,
  //     latitude,
  //     longitude,
  //   });
  // }

  const handleMapPress = (e: any) => {
    console.log('handleMapPress', e);
    const { latitude, longitude } = e.nativeEvent.coordinate;

    setRegion({
      ...region,
      latitude,
      longitude,
    });
    getAddress(latitude, longitude);
  }
  const extractAddress = (components: any) => {
    let streetNumber = "";
    let route = "";
    let sublocality = "";
    let city = "";
    let state = "";
    let postalCode = "";
    let country = "";
    let landmark = "";

    components.forEach((component: any) => {
      const types = component.types;

      if (types.includes("street_number")) {
        streetNumber = component.long_name;
      }

      if (types.includes("route")) {
        route = component.long_name;
      }

      if (types.includes("sublocality") || types.includes("neighborhood")) {
        sublocality = component.long_name;
      }

      if (types.includes("locality")) {
        city = component.long_name;
      }

      if (types.includes("administrative_area_level_1")) {
        state = component.long_name;
      }

      if (types.includes("postal_code")) {
        postalCode = component.long_name;
      }

      if (types.includes("country")) {
        country = component.long_name;
      }

      if (types.includes("point_of_interest") || types.includes("premise")) {
        landmark = component.long_name;
      }
    });

    return {
      addressLine1: `${streetNumber} ${route}`.trim(),
      addressLine2: sublocality,
      city,
      state,
      postalCode,
      country,
      landmark
    };
  };
  const getAddress = async (lat: number, lng: number) => {
    try {
      const response = await Geocoder.from(lat, lng);

      if (response.results.length > 0) {
        const result = response.results[0];
        const components = result.address_components;
        let addressdata = extractAddress(components);
        console.log('addressdata', addressdata);
        formik.setFieldValue('line1', addressdata?.addressLine1 || '');
        formik.setFieldValue('line2', addressdata?.addressLine2 || '');
        formik.setFieldValue('landmark', addressdata?.landmark || '');
        formik.setFieldValue('pincode', addressdata?.postalCode || '');
        formik.setFieldValue('coordinates', {
          lat,
          lng,
        });
        setTimeout(() => {
          formik.setFieldTouched('line1', true);
          formik.setFieldTouched('pincode', true);
          formik.setFieldTouched('line2', true);
          formik.setFieldTouched('landmark', true);
        }, 100);
      }

    } catch (error) {
      console.log(error);
    }
  };




  return (
    <Container safeArea={true}>
      <LoadingComp visible={locationLoading} />
      <AppHeader
        title={addData?._id ? t('addAddress.edittitle') : t('addAddress.title')}
        onLeftPress={() => navigation.goBack()}
        containerStyle={styles.header}
      />

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

            {hasPermission && location ? (
              <View style={{ height: SH(300), width: '100%' }}>
                <MapView
                  style={{ height: '100%', width: '100%' }}
                  provider={PROVIDER_GOOGLE}
                  initialRegion={region}
                  onPress={handleMapPress}
                >

                  <Marker
                    // draggable
                    coordinate={{
                      latitude: region.latitude,
                      longitude: region.longitude,
                    }}
                  // title="Hello"
                  // description="Hello"
                  // onDragEnd={handleDragEnd}

                  />
                </MapView>
              </View>
            ) :
              <View style={{ padding: SW(20), alignItems: 'center' }}>
                <CustomText fontFamily={Fonts.REGULAR} fontSize={SF(16)} textAlign={'center'} color={Colors.textAppColor}>{"To use the map and detect your current location, please enable location permission. You can also manually choose a location on the map."}</CustomText>
                <View style={{ width: '50%', alignItems: 'center' }}>
                  <CustomButton
                    buttonStyle={{ backgroundColor: Colors.primary, marginTop: SH(20) }}
                    textColor={Colors.textWhite}
                    title={'Retry'}
                    onPress={retry}
                  />
                </View>
              </View>
            }

            <View style={{ paddingHorizontal: SW(20), marginTop: SH(20) }}>

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
                  editable={false}
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
                // prevScreen !== 'other_user' &&
                // <>

                //   <CustomText style={styles.addressTypeLabel}>{t('addAddress.placeholders.addressType') || 'Address Type'}</CustomText>
                //   <View style={styles.addressTypeContainer}>
                //     {addressTypes.map((type) => (
                //       <Checkbox
                //         key={type}
                //         checked={selectedAddressType === type}
                //         onChange={() => {
                //           setSelectedAddressType(type);
                //           formik.setFieldValue('addressType', type);
                //           // Auto-fill name if empty
                //           if (!formik.values.name) {
                //             formik.setFieldValue('name', type.charAt(0).toUpperCase() + type.slice(1));
                //           }
                //           formik.setFieldTouched('addressType', true);
                //         }}
                //         size={SF(14)}
                //         label={type.charAt(0).toUpperCase() + type.slice(1)}
                //       />
                //     ))}
                //   </View>
                //   {formik.touched.addressType && formik.errors.addressType && (
                //     <CustomText style={styles.errorText}>{formik.errors.addressType}</CustomText>
                //   )}
                //   {/* <View style={styles.checkboxContainer}>
                //     <Checkbox
                //       checked={isDefault}
                //       onChange={() => setIsDefault(!isDefault)}
                //       size={SF(14)}
                //       label={t('addAddress.makeThisDefault')}
                //     />
                //   </View> */}
                // </>
              }
              <CustomButton
                buttonStyle={styles.submitButton}
                textColor={Colors.textWhite}
                title={t('addAddress.placeholders.save')}
                onPress={formik.handleSubmit}
                isLoading={addAddressMutation.isPending || updateAddressMutation.isPending || formik.isSubmitting}
              />
            </View>
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
    paddingBottom: SH(20),
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