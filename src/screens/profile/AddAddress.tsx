import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import React, { useMemo, useRef, useCallback, useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppSelector } from '@store/hooks';
import { ThemeType, useThemeContext } from '@utils/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AppHeader,
  CustomButton,
  CustomInput,
  CustomText,
  VectoreIcons,
} from '@components';
import { goBack, SH, useLocation } from '@utils/index';
import { useTranslation } from 'react-i18next';
import {
  GooglePlacesAutocomplete,
  GooglePlacesAutocompleteRef,
} from 'react-native-google-places-autocomplete';
import Geocoder from 'react-native-geocoding';
import { showToast } from '@components/common/CustomToast';
import { useRoute } from '@react-navigation/native';
import type { SignupAddressSelection } from '@utils/address';
import type { CustomerAddressCreateBody } from '@services/api/queries/appQueries';
import { useAddCustomerAddress, useUpdateCustomerAddress } from '@services';
import { queryClient } from '@services/api';
import {
  handleApiError,
  handleApiFailureResponse,
  handleSuccessToast,
} from '@utils/apiHelpers';
import type { UserDetails } from '@store/slices/authSlice';

const GOOGLE_MAPS_API_KEY = 'AIzaSyALC5b7touq90VVqX9U96jVMPHjJ5_We8s';
Geocoder.init(GOOGLE_MAPS_API_KEY);

/** International postal / ZIP: 2–16 chars, letters, digits, spaces, hyphens (covers IN, US, UK, CA, DE, BR, etc.). */
const POSTAL_CODE_REGEX = /^[A-Za-z0-9](?:[A-Za-z0-9\s\-]{0,14}[A-Za-z0-9])?$/;

/** Stable empty ref — inline `[]` breaks GooglePlacesAutocomplete useMemo/useEffect deps every render. */
const NO_PREDEFINED_PLACES: never[] = [];

const GOOGLE_PLACES_DETAILS_FIELDS =
  'geometry,address_components,formatted_address,place_id' as const;

type SignupAddressLike = Partial<SignupAddressSelection> & {
  formattedAddress?: string;
};

/** Row from GET `/auth/customer/addresses` (edit) */
type ApiSavedAddress = {
  _id?: string;
  name?: string;
  line1?: string;
  line2?: string;
  landmark?: string;
  pincode?: string;
  contact?: string;
  formattedAddress?: string;
  googlePlaceId?: string | null;
  cityName?: string;
  countryName?: string;
  countryIso2?: string;
  coordinates?: { lat: number; lng: number };
  city?: { name?: string; countryIso2?: string };
  country?: { name?: string };
};

function resolveCustomerContact(user: UserDetails | null | undefined): string | null {
  if (!user) return null;
  const raw = user.contact ?? user.mobile ?? user.phone;
  if (raw == null || String(raw).trim() === '') return null;
  const compact = String(raw).trim().replace(/\s/g, '');
  if (compact.startsWith('+')) return compact;
  const code =
    user.country?.phoneCode ??
    user.phoneCode ??
    user.countryPhoneCode;
  if (code != null && String(code).trim() !== '') {
    const digits = compact.replace(/\D/g, '');
    const cc = String(code).replace(/\D/g, '');
    return `+${cc}${digits}`;
  }
  const digitsOnly = compact.replace(/\D/g, '');
  return digitsOnly ? `+${digitsOnly}` : null;
}

function resolveSubmitContact(
  user: UserDetails | null | undefined,
  saved: ApiSavedAddress | undefined,
): string | null {
  const fromProfile = resolveCustomerContact(user);
  if (fromProfile) return fromProfile;
  const raw = saved?.contact;
  if (raw == null || String(raw).trim() === '') return null;
  return String(raw).trim().replace(/\s/g, '');
}

function buildSignupAddressSelection(values: {
  line1: string;
  formattedAddress: string;
  cityName: string;
  countryName: string;
  countryIso2: string;
  pincode: string;
  lat: string;
  lng: string;
  googlePlaceId: string;
}): SignupAddressSelection {
  return {
    formattedAddress: (values.formattedAddress || values.line1).trim(),
    googlePlaceId: values.googlePlaceId?.trim() || undefined,
    cityName: values.cityName.trim(),
    countryName: values.countryName.trim(),
    countryIso2: values.countryIso2.trim().toLowerCase(),
    pincode: (values.pincode || '').trim(),
    coordinates: {
      lat: Number(values.lat),
      lng: Number(values.lng),
    },
  };
}

function applyGeocoderResult(
  res: {
    address_components?: {
      long_name: string;
      short_name: string;
      types: string[];
    }[];
    formatted_address?: string;
  },
  lat: number,
  lng: number,
) {
  const parsed = parseGoogleAddressComponents({
    address_components: res.address_components,
    formatted_address: res.formatted_address,
    geometry: { location: { lat, lng } },
    place_id: '',
  });
  return {
    ...parsed,
    googlePlaceId: '',
    formattedAddress: res.formatted_address ?? parsed.line1,
  };
}

function parseGoogleAddressComponents(details: {
  address_components?: {
    long_name: string;
    short_name: string;
    types: string[];
  }[];
  formatted_address?: string;
  geometry?: { location?: { lat: number; lng: number } };
  place_id?: string;
}) {
  const components = details?.address_components ?? [];
  let route = '';
  let streetNumber = '';
  let city = '';
  let postal = '';
  let country = '';
  let countryIso2 = '';

  for (const c of components) {
    const types = c.types;
    if (types.includes('street_number')) streetNumber = c.long_name;
    if (types.includes('route')) route = c.long_name;
    if (types.includes('locality')) city = c.long_name;
    if (types.includes('postal_town') && !city) city = c.long_name;
    if (types.includes('sublocality_level_1') && !city) city = c.long_name;
    if (types.includes('administrative_area_level_2') && !city)
      city = c.long_name;
    if (types.includes('postal_code')) postal = c.long_name;
    if (types.includes('country')) {
      country = c.long_name;
      countryIso2 = (c.short_name || '').toLowerCase();
    }
  }

  const streetLine = [streetNumber, route].filter(Boolean).join(' ').trim();
  const line1 =
    streetLine ||
    details.formatted_address?.split(',')[0]?.trim() ||
    details.formatted_address ||
    '';

  const loc = details.geometry?.location as
    | { lat?: number | (() => number); lng?: number | (() => number) }
    | undefined;
  let lat: number | undefined;
  let lng: number | undefined;
  if (loc) {
    lat = typeof loc.lat === 'function' ? (loc.lat as () => number)() : loc.lat;
    lng = typeof loc.lng === 'function' ? (loc.lng as () => number)() : loc.lng;
  }

  return {
    line1,
    cityName: city,
    pincode: postal,
    countryName: country,
    countryIso2,
    lat: lat != null ? String(lat) : '',
    lng: lng != null ? String(lng) : '',
    googlePlaceId: details.place_id ?? '',
    formattedAddress: details.formatted_address ?? line1,
  };
}

export default function AddressAdd() {
  const { userDetails } = useAppSelector(state => state.auth);
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  const placesRef = useRef<GooglePlacesAutocompleteRef>(null);
  const locationFlowPendingRef = useRef(false);
  const { loading, error, fetchLocation } = useLocation();
  const [fillingFromLocation, setFillingFromLocation] = useState(false);
  const route = useRoute<any>();
  const isSignupFlow = route.params?.prevScreen === 'signup';
  const isEditMode = route.params?.mode === 'edit';
  const savedAddress = route.params?.addData as ApiSavedAddress | undefined;
  const editAddressId =
    isEditMode && savedAddress?._id ? String(savedAddress._id) : '';

  const addAddressMutation = useAddCustomerAddress();
  const updateAddressMutation = useUpdateCustomerAddress();

  const validationSchema = useMemo(
    () =>
      Yup.object({
        name: isSignupFlow
          ? Yup.string().trim().max(80, t('addAddress.validation.nameMaxLength'))
          : Yup.string()
              .trim()
              .min(2, t('addAddress.validation.nameMinLength'))
              .max(80, t('addAddress.validation.nameMaxLength'))
              .required(t('addAddress.validation.nameEmpty')),
        line1: Yup.string()
          .trim()
          .required(t('addAddress.validation.line1Empty'))
          .min(5, t('addAddress.validation.line1MinLength')),
        line2: Yup.string().trim().max(100),
        landmark: Yup.string().trim().max(100),
        pincode: isEditMode
          ? Yup.string()
              .trim()
              .required(t('addAddress.validation.pincodeEmpty'))
              .min(2, t('addAddress.validation.validPostalCode'))
              .max(16, t('addAddress.validation.validPostalCode'))
              .matches(
                POSTAL_CODE_REGEX,
                t('addAddress.validation.validPostalCode'),
              )
          : Yup.string()
              .trim()
              .max(16, t('addAddress.validation.validPostalCode'))
              .test(
                'postal-optional',
                t('addAddress.validation.validPostalCode'),
                v => {
                  if (v == null || v === '') return true;
                  return (
                    POSTAL_CODE_REGEX.test(v) &&
                    v.length >= 2 &&
                    v.length <= 16
                  );
                },
              ),
        countryName: Yup.string()
          .trim()
          .required(t('addAddress.validation.countryEmpty')),
        cityName: Yup.string()
          .trim()
          .required(t('addAddress.validation.cityEmpty')),
        countryIso2: Yup.string()
          .trim()
          .test('iso', t('addAddress.validation.countryIsoInvalid'), v => {
            if (v == null || v === '') return true;
            return /^[a-zA-Z]{2}$/.test(v);
          }),
        lat: Yup.string()
          .trim()
          .required(t('addAddress.validation.latRequired'))
          .test('lat-range', t('addAddress.validation.latInvalid'), v => {
            const n = Number(v);
            return !Number.isNaN(n) && n >= -90 && n <= 90;
          }),
        lng: Yup.string()
          .trim()
          .required(t('addAddress.validation.lngRequired'))
          .test('lng-range', t('addAddress.validation.lngInvalid'), v => {
            const n = Number(v);
            return !Number.isNaN(n) && n >= -180 && n <= 180;
          }),
        googlePlaceId: Yup.string().trim(),
        formattedAddress: Yup.string().trim(),
      }),
    [t, isSignupFlow, isEditMode],
  );

  const countryIsoUpper = (userDetails?.countryIso2?.toUpperCase?.() ||
    'IN') as string;

  const placesQuery = useMemo(
    () => ({
      key: GOOGLE_MAPS_API_KEY,
      language: 'en',
      components: `country:${countryIsoUpper}`,
    }),
    [countryIsoUpper],
  );

  const placesDetailsQuery = useMemo(
    () => ({ fields: GOOGLE_PLACES_DETAILS_FIELDS }),
    [],
  );

  const initialValues = useMemo(() => {
    const base = {
      line1: '',
      line2: '',
      landmark: '',
      pincode: '',
      countryName: '',
      cityName: '',
      countryIso2:
        (userDetails?.countryIso2 as string)?.toLowerCase?.() || '',
      lat: '',
      lng: '',
      googlePlaceId: '',
      formattedAddress: '',
      name: '',
    };
    const d = route.params?.addData as
      | SignupAddressLike
      | ApiSavedAddress
      | undefined;

    if (!d) return base;

    if (isEditMode && '_id' in d && (d as ApiSavedAddress)._id) {
      const a = d as ApiSavedAddress;
      const displayLine =
        a.formattedAddress || a.line1 || '';
      const cityNm = a.cityName ?? a.city?.name ?? '';
      const countryNm = a.countryName ?? a.country?.name ?? '';
      let iso =
        a.countryIso2 ??
        a.city?.countryIso2 ??
        base.countryIso2;
      iso = String(iso || '')
        .trim()
        .toLowerCase()
        .slice(0, 2);
      if (!/^[a-z]{2}$/.test(iso)) iso = base.countryIso2;

      return {
        ...base,
        name: a.name ?? '',
        line1: a.line1 ?? displayLine,
        line2: a.line2 ?? '',
        landmark: a.landmark ?? '',
        pincode: a.pincode ?? '',
        countryName: countryNm,
        cityName: cityNm,
        countryIso2: iso,
        lat:
          a.coordinates != null ? String(a.coordinates.lat) : '',
        lng:
          a.coordinates != null ? String(a.coordinates.lng) : '',
        googlePlaceId:
          a.googlePlaceId != null && a.googlePlaceId !== ''
            ? String(a.googlePlaceId)
            : '',
        formattedAddress: a.formattedAddress ?? a.line1 ?? '',
      };
    }

    if (
      typeof (d as SignupAddressLike).formattedAddress === 'string' &&
      (d as SignupAddressLike).formattedAddress
    ) {
      const s = d as SignupAddressLike;
      return {
        ...base,
        line1: s.formattedAddress!,
        name: (s as { name?: string }).name ?? '',
        formattedAddress: s.formattedAddress,
        cityName: s.cityName ?? '',
        countryName: s.countryName ?? '',
        countryIso2: (s.countryIso2 ?? base.countryIso2).toLowerCase(),
        pincode: s.pincode ?? '',
        lat: s.coordinates != null ? String(s.coordinates.lat) : '',
        lng: s.coordinates != null ? String(s.coordinates.lng) : '',
        googlePlaceId: s.googlePlaceId != null ? String(s.googlePlaceId) : '',
      };
    }

    return base;
  }, [userDetails?.countryIso2, route.params?.addData, isEditMode]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      if (isSignupFlow) {
        const selection = buildSignupAddressSelection({
          ...values,
          formattedAddress:
            values.formattedAddress ?? values.line1 ?? '',
        });
        route.params?.onDone?.(selection);
        goBack();
        return;
      }

      // const contact = resolveSubmitContact(userDetails, savedAddress);
      // if (!contact) {
      //   showToast({
      //     type: 'error',
      //     title: t('messages.error'),
      //     message: t('addAddress.errors.contactMissing'),
      //   });
      //   setSubmitting(false);
      //   return;
      // }

      if (isEditMode && !editAddressId) {
        showToast({
          type: 'error',
          title: t('messages.error'),
          message: t('messages.somethingWentWrong'),
        });
        setSubmitting(false);
        return;
      }

      const gid = (values.googlePlaceId || '').trim();
      const body: CustomerAddressCreateBody = {
        name: values.name.trim(),
        line1: values.line1.trim(),
        line2: (values.line2 || '').trim(),
        landmark: (values.landmark || '').trim(),
        pincode: (values.pincode || '').trim(),
        // contact,
        coordinates: {
          lat: Number(values.lat),
          lng: Number(values.lng),
        },
        googlePlaceId: gid === '' ? (isEditMode ? null : '') : gid,
        formattedAddress: (
          values.formattedAddress ||
          values.line1 ||
          ''
        ).trim(),
        cityName: values.cityName.trim(),
        countryName: values.countryName.trim(),
        countryIso2: values.countryIso2.trim().toLowerCase(),
      };

      try {
        let response: { succeeded?: boolean; ResponseMessage?: string };
        if (isEditMode && editAddressId) {
          response = (await updateAddressMutation.mutateAsync({
            addressId: editAddressId,
            data: body,
          })) as { succeeded?: boolean; ResponseMessage?: string };
        } else {
          response = (await addAddressMutation.mutateAsync(
            body,
          )) as { succeeded?: boolean; ResponseMessage?: string };
        }
        if (response?.succeeded) {
          handleSuccessToast(
            response.ResponseMessage ||
              (isEditMode
                ? t('addAddress.editAddaddressSuccess')
                : t('addAddress.addaddressSuccess')),
          );
          await queryClient.invalidateQueries({
            queryKey: ['customerAddresses'],
          });
          goBack();
        } else {
          handleApiFailureResponse(
            response,
            t('messages.somethingWentWrong'),
          );
        }
      } catch (err) {
        handleApiError(err);
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    const d = route.params?.addData as
      | ApiSavedAddress
      | SignupAddressLike
      | undefined;
    if (!d) return;
    const text =
      (d as ApiSavedAddress).formattedAddress ||
      (d as ApiSavedAddress).line1 ||
      (d as SignupAddressLike).formattedAddress;
    if (text && typeof text === 'string') {
      placesRef.current?.setAddressText(text);
    }
  }, [route.params?.addData, route.params?.mode]);

  const formikRef = useRef(formik);
  formikRef.current = formik;

  const onGooglePlacePress = useCallback(
    (
      data: { description: string; place_id?: string },
      details: object | null,
    ) => {
      if (!details || typeof details !== 'object') return;
      const f = formikRef.current;
      const parsed = parseGoogleAddressComponents(
        details as Parameters<typeof parseGoogleAddressComponents>[0],
      );

      f.setFieldValue('line1', data.description || parsed.line1);
      if (parsed.pincode) f.setFieldValue('pincode', parsed.pincode);
      if (parsed.countryName)
        f.setFieldValue('countryName', parsed.countryName);
      if (parsed.cityName) f.setFieldValue('cityName', parsed.cityName);
      if (parsed.countryIso2)
        f.setFieldValue('countryIso2', parsed.countryIso2);
      if (parsed.lat) f.setFieldValue('lat', parsed.lat);
      if (parsed.lng) f.setFieldValue('lng', parsed.lng);
      if (parsed.googlePlaceId)
        f.setFieldValue('googlePlaceId', parsed.googlePlaceId);

      f.setFieldValue('formattedAddress', parsed.formattedAddress);
      placesRef.current?.setAddressText(data.description);
    },
    [],
  );

  const handleUseCurrentLocation = useCallback(async () => {
    if (locationFlowPendingRef.current) return;
    locationFlowPendingRef.current = true;
    setFillingFromLocation(true);
    try {
      const loc = await fetchLocation();
      if (!loc) {
        return;
      }

      const response = await Geocoder.from(loc.latitude, loc.longitude);

      if (!response.results?.length) {
        return;
      }

      const result = response.results[0];
      const patch = applyGeocoderResult(result, loc.latitude, loc.longitude);
      const f = formikRef.current;

      f.setFieldValue('lat', patch.lat);
      f.setFieldValue('lng', patch.lng);
      if (patch.pincode) f.setFieldValue('pincode', patch.pincode);
      if (patch.countryName) f.setFieldValue('countryName', patch.countryName);
      if (patch.cityName) f.setFieldValue('cityName', patch.cityName);
      if (patch.countryIso2) f.setFieldValue('countryIso2', patch.countryIso2);
      f.setFieldValue('googlePlaceId', '');

      const formattedAddress =
        result.formatted_address || patch.formattedAddress || patch.line1;
      if (formattedAddress) {
        f.setFieldValue('line1', formattedAddress);
        f.setFieldValue('formattedAddress', formattedAddress);
        placesRef.current?.setAddressText(formattedAddress);
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      showToast({
        type: 'error',
        title: t('messages.error') || 'Error',
        message:
          t('addAddress.geocodingError') ||
          t('messages.somethingWentWrong'),
      });
    } finally {
      locationFlowPendingRef.current = false;
      setFillingFromLocation(false);
    }
  }, [fetchLocation, t]);

  const placesStyles = useMemo(
    () => ({
      textInput: {
        borderColor: '#000',
        borderWidth: 1,
        borderRadius: 6,
        padding: 10,
        marginVertical: 5,
      },
      container: styles.autocompleteContainer,
      listView: {
        backgroundColor: 'white',
        position: 'absolute' as const,
        zIndex: 999,
        width: '100%' as const,
        top: SH(58),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        borderRadius: 5,
      },
      separator: {
        height: 0.5,
        backgroundColor: 'gray',
      },
    }),
    [styles.autocompleteContainer],
  );

  const placesTextInputProps = useMemo(
    () => ({
      // Do not pass `value` here: it overrides the library's stateText and, with
      // changing `query` refs, caused update-depth loops (see useEffect [props.query]).
      onChangeText: (text: string) => {
        formikRef.current.setFieldValue('line1', text);
      },
      onBlur: () => {
        formikRef.current.setFieldTouched('line1', true);
      },
    }),
    [],
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AppHeader
            title={
              route.params?.mode === 'edit'
                ? t('addAddress.edittitle')
                : t('addAddress.title')
            }
            onLeftPress={() => goBack()}
            backgroundColor={theme.colors.white}
            tintColor={theme.colors.text}
          />

          {error ? (
            <CustomText style={styles.locationError}>{error}</CustomText>
          ) : null}

          <Pressable
            onPress={() => void handleUseCurrentLocation()}
            disabled={loading || fillingFromLocation}
            style={[
              styles.locationRow,
              (loading || fillingFromLocation) && styles.locationRowDisabled,
            ]}
          >
            <View style={styles.locationContent}>
              <VectoreIcons
                icon="FontAwesome6"
                name="location-dot"
                size={theme.SF(18)}
                color={theme.colors.primary}
              />
              <CustomText style={styles.locationText}>
                {t('addAddress.useMyCurrentLocation')}
              </CustomText>
              {loading || fillingFromLocation ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : null}
            </View>
            <VectoreIcons
              icon="Feather"
              name="chevron-right"
              size={theme.SF(24)}
              color={theme.colors.primary}
            />
          </Pressable>

          {isSignupFlow ? null : (
            <>
              <CustomText style={styles.level}>
                {t('addAddress.labels.addressName')}
              </CustomText>
              <CustomInput
                placeholder={t('addAddress.placeholders.name')}
                value={formik.values.name}
                onChangeText={formik.handleChange('name')}
                onBlur={() => formik.setFieldTouched('name', true)}
                marginTop={theme.SH(10)}
                maxLength={80}
                errortext={
                  formik.touched.name && formik.errors.name
                    ? String(formik.errors.name)
                    : ''
                }
              />
            </>
          )}

          <View style={styles.autocompleteContainer}>
            <CustomText style={styles.level}>
              {t('addAddress.labels.addressLine1')}
            </CustomText>
            <GooglePlacesAutocomplete
              ref={placesRef}
              placeholder={t('addAddress.placeholders.streetAddress')}
              fetchDetails={true}
              keyboardShouldPersistTaps="handled"
              onPress={onGooglePlacePress}
              query={placesQuery}
              GooglePlacesDetailsQuery={placesDetailsQuery}
              onFail={(e: unknown) => console.error('Google Places:', e)}
              onNotFound={() => {}}
              styles={placesStyles}
              debounce={200}
              timeout={20000}
              minLength={3}
              predefinedPlaces={NO_PREDEFINED_PLACES}
              textInputProps={placesTextInputProps}
            />
            {formik.touched.line1 && formik.errors.line1 ? (
              <CustomText style={styles.fieldError}>
                {formik.errors.line1}
              </CustomText>
            ) : null}

            <CustomText style={styles.level}>
              {t('addAddress.labels.addressLine2Optional')}
            </CustomText>
            <CustomInput
              placeholder={t('addAddress.placeholders.apartment')}
              value={formik.values.line2}
              onChangeText={formik.handleChange('line2')}
              onBlur={() => formik.setFieldTouched('line2', true)}
              marginTop={theme.SH(10)}
              maxLength={100}
              errortext={
                formik.touched.line2 && formik.errors.line2
                  ? String(formik.errors.line2)
                  : ''
              }
            />

            <CustomText style={styles.level}>
              {t('addAddress.labels.landmarkOptional')}
            </CustomText>
            <CustomInput
              placeholder={t('addAddress.placeholders.landmark')}
              value={formik.values.landmark}
              onChangeText={formik.handleChange('landmark')}
              onBlur={() => formik.setFieldTouched('landmark', true)}
              marginTop={theme.SH(10)}
              maxLength={100}
            />

            <View style={styles.coordsRow}>
              <View style={styles.coordsCol}>
                <CustomText style={styles.level}>
                  {t('addAddress.labels.city')}
                </CustomText>
                <CustomInput
                  placeholder={t('addAddress.placeholders.city')}
                  value={formik.values.cityName}
                  onChangeText={formik.handleChange('cityName')}
                  onBlur={() => formik.setFieldTouched('cityName', true)}
                  marginTop={theme.SH(8)}
                  maxLength={80}
                  errortext={
                    formik.touched.cityName && formik.errors.cityName
                      ? String(formik.errors.cityName)
                      : ''
                  }
                />
              </View>
              <View style={styles.coordsCol}>
                <CustomText style={styles.level}>
                  {t('addAddress.labels.country')}
                </CustomText>
                <CustomInput
                  placeholder={t('addAddress.placeholders.country')}
                  value={formik.values.countryName}
                  onChangeText={formik.handleChange('countryName')}
                  onBlur={() => formik.setFieldTouched('countryName', true)}
                  marginTop={theme.SH(8)}
                  maxLength={80}
                  errortext={
                    formik.touched.countryName && formik.errors.countryName
                      ? String(formik.errors.countryName)
                      : ''
                  }
                />
              </View>
            </View>

            <CustomText style={styles.level}>
              {t('addAddress.labels.countryIso2')}
            </CustomText>
            <CustomInput
              placeholder={t('addAddress.placeholders.countryIso2')}
              value={formik.values.countryIso2}
              onChangeText={text =>
                formik.setFieldValue(
                  'countryIso2',
                  text.toLowerCase().slice(0, 2),
                )
              }
              onBlur={() => formik.setFieldTouched('countryIso2', true)}
              marginTop={theme.SH(10)}
              maxLength={2}
              autoCapitalize="none"
              errortext={
                formik.touched.countryIso2 && formik.errors.countryIso2
                  ? String(formik.errors.countryIso2)
                  : ''
              }
            />

            <CustomText style={styles.level}>
              {t('addAddress.labels.postalCode')}
            </CustomText>
            <CustomInput
              placeholder={t('addAddress.placeholders.postalCode')}
              value={formik.values.pincode}
              onChangeText={formik.handleChange('pincode')}
              onBlur={() => formik.setFieldTouched('pincode', true)}
              marginTop={theme.SH(10)}
              maxLength={16}
              errortext={
                formik.touched.pincode && formik.errors.pincode
                  ? String(formik.errors.pincode)
                  : ''
              }
            />

            <View style={styles.coordsRow}>
              <View style={styles.coordsCol}>
                <CustomText style={styles.level}>
                  {t('addAddress.placeholders.latitude')}
                </CustomText>
                <CustomInput
                  placeholder={t('addAddress.placeholders.latitude')}
                  value={formik.values.lat}
                  onChangeText={formik.handleChange('lat')}
                  onBlur={() => formik.setFieldTouched('lat', true)}
                  marginTop={theme.SH(8)}
                  keyboardType="numbers-and-punctuation"
                  errortext={
                    formik.touched.lat && formik.errors.lat
                      ? String(formik.errors.lat)
                      : ''
                  }
                />
              </View>
              <View style={styles.coordsCol}>
                <CustomText style={styles.level}>
                  {t('addAddress.placeholders.longitude')}
                </CustomText>
                <CustomInput
                  placeholder={t('addAddress.placeholders.longitude')}
                  value={formik.values.lng}
                  onChangeText={formik.handleChange('lng')}
                  onBlur={() => formik.setFieldTouched('lng', true)}
                  marginTop={theme.SH(8)}
                  keyboardType="numbers-and-punctuation"
                  errortext={
                    formik.touched.lng && formik.errors.lng
                      ? String(formik.errors.lng)
                      : ''
                  }
                />
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <CustomButton
            title={t('addAddress.saveButton')}
            backgroundColor={theme.colors.primary}
            textColor={theme.colors.white}
            onPress={() => formik.handleSubmit()}
            marginTop={theme.SH(10)}
            isLoading={
              formik.isSubmitting ||
              (!isSignupFlow &&
                (addAddressMutation.isPending ||
                  updateAddressMutation.isPending))
            }
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.white,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: theme.SW(20),
      paddingBottom: theme.SH(100),
    },
    locationRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: theme.SH(20),
      paddingVertical: theme.SH(12),
      paddingHorizontal: theme.SW(15),
      backgroundColor: theme.colors.secondary || '#F5F5F5',
      borderRadius: theme.borderRadius.md,
    },
    locationRowDisabled: {
      opacity: 0.7,
    },
    locationError: {
      color: theme.colors.errorText,
      fontSize: theme.fontSize.sm,
      fontFamily: theme.fonts.REGULAR,
      marginBottom: theme.SH(8),
    },
    fieldError: {
      color: theme.colors.errorText,
      fontSize: theme.fontSize.xs,
      fontFamily: theme.fonts.REGULAR,
      marginTop: theme.SH(4),
    },
    locationContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.SW(10),
    },
    locationText: {
      color: theme.colors.primary,
      fontFamily: theme.fonts.SEMI_BOLD,
      fontSize: theme.fontSize.md,
    },
    autocompleteContainer: {
      flex: 0,
    },
    buttonContainer: {
      paddingHorizontal: theme.SW(20),
      paddingBottom: theme.SH(24),
      paddingTop: theme.SH(8),
      backgroundColor: theme.colors.white,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.secondary || '#EAEAEA',
    },
    level: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.text,
      fontFamily: theme.fonts.REGULAR,
      marginTop: theme.SH(10),
      textAlign: 'left',
    },
    coordsRow: {
      flexDirection: 'row',
      gap: theme.SW(12),
      marginTop: theme.SH(8),
    },
    coordsCol: {
      flex: 1,
    },
  });
