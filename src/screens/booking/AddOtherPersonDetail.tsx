import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Keyboard,
  StyleSheet,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  AppHeader,
  Container,
  CustomButton,
  CustomInput,
  CustomText,
  showToast,
} from '@components';
import { Colors, Fonts, regex, SF, SH, SW } from '@utils';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { KeyboardFormScroll } from '@components/common';
import SCREEN_NAMES from '@navigation/ScreenNames';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useGetCustomerAddresses } from '@services/index';
import { Address } from '@services/api/queries/appQueries';
import imagePaths from '@assets';
import { formatAddress, requestContactsPermission } from '@utils/tools';
import PhoneNumberPicker from '@components/auth/PhoneNumberPicker';
import PhoneCountryPicker from '@components/auth/PhoneCountryPicker';
import Contacts from 'react-native-contacts';
import {
  isValidNationalPhoneNumber,
  parseContactPhoneNumber,
} from '@utils/phoneValidation';
import {
  addressMatchesAtHomeCountry,
  phoneCountryMatchesAtHomeCountry,
  type AtHomeCountryRestriction,
  type Address as CheckoutAddress,
} from './checkoutHelpers';

interface FormValues {
  fname: string;
  nationalNumber: string;
  email: string;
  phoneDialCode: string;
  phoneCountryIso2: string;
  address: string;
}

type ContactListItem = {
  _id: string;
  phoneNumber: string;
  displayName: string;
};

const AddOtherPersonDetail: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const addressFromPreviousPage = route.params?.address || '';
  const addressRequired = route.params?.addressRequired !== false;
  const allowedCountry: AtHomeCountryRestriction = useMemo(
    () =>
      route.params?.allowedCountryName ||
      route.params?.allowedCountryIso2 ||
      route.params?.allowedPhoneCode
        ? {
            name: route.params?.allowedCountryName,
            iso2: route.params?.allowedCountryIso2,
            phoneCode: route.params?.allowedPhoneCode,
          }
        : null,
    [
      route.params?.allowedCountryName,
      route.params?.allowedCountryIso2,
      route.params?.allowedPhoneCode,
    ],
  );
  const allowedCountryLabel =
    allowedCountry?.name || allowedCountry?.iso2?.toUpperCase() || '';
  const initialPhoneDialCode = allowedCountry?.phoneCode || '+91';
  const initialPhoneCountryIso2 =
    allowedCountry?.phoneCode && allowedCountry?.iso2
      ? allowedCountry.iso2
      : 'in';
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactList, setContactList] = useState<ContactListItem[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

  const { refetch: refetchAddresses } = useGetCustomerAddresses();

  const validationSchema = useMemo(
    () =>
      Yup.object().shape({
        fname: Yup.string()
          .trim()
          .min(3, t('validation.fullnameMinLength'))
          .required(t('validation.emptyFullName'))
          .matches(regex.NAME_REGEX, t('validation.validFullName')),
        email: Yup.string()
          .trim()
          .matches(regex.EMAIL_REGEX_WITH_EMPTY, t('validation.validEmail'))
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
        address: addressRequired
          ? Yup.string()
              .trim()
              .required(
                t('addAddress.validation.line1Empty') || 'Address is required',
              )
              .min(5, 'Minimum length 5')
          : Yup.string().trim(),
      }),
    [t, addressRequired],
  );

  const formik = useFormik<FormValues>({
    initialValues: {
      fname: '',
      nationalNumber: '',
      email: '',
      phoneDialCode: initialPhoneDialCode,
      phoneCountryIso2: initialPhoneCountryIso2,
      address: addressFromPreviousPage,
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      Keyboard.dismiss();
      try {
        if (addressRequired && !selectedAddress) {
          formik.setFieldTouched('address', true);
          setSubmitting(false);
          return;
        }

        if (
          addressRequired &&
          !addressMatchesAtHomeCountry(
            selectedAddress as CheckoutAddress | null,
            allowedCountry,
          )
        ) {
          showToast({
            type: 'info',
            message: t('checkout.atHomeCountryRestriction', {
              country: allowedCountryLabel || t('checkout.sameCountry'),
            }),
          });
          setSubmitting(false);
          return;
        }

        if (
          !phoneCountryMatchesAtHomeCountry(
            values.phoneCountryIso2,
            values.phoneDialCode,
            allowedCountry,
          )
        ) {
          showToast({
            type: 'info',
            message: t('checkout.atHomePhoneCountryRestriction', {
              country: allowedCountryLabel || t('checkout.sameCountry'),
            }),
          });
          setSubmitting(false);
          return;
        }

        const nationalDigits = String(values.nationalNumber || '').replace(
          /\D/g,
          '',
        );
        const dial = String(values.phoneDialCode || '').replace(/\s/g, '');
        const phoneCode = dial
          ? dial.startsWith('+')
            ? dial
            : `+${dial.replace(/^\++/, '')}`
          : '';

        const data = {
          name: values.fname,
          email: values.email,
          phone: nationalDigits,
          countryCode: phoneCode,
          phoneCountryIso2: values.phoneCountryIso2,
          address: selectedAddress ?? undefined,
        };

        const onSelect = route.params?.onSelect;
        if (onSelect) {
          onSelect(data);
        }
        navigation.goBack();
      } catch (error) {
        console.error('Error submitting other person details:', error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const addressRestrictionToast = useCallback(() => {
    showToast({
      type: 'info',
      message: t('checkout.atHomeCountryRestriction', {
        country: allowedCountryLabel || t('checkout.sameCountry'),
      }),
    });
  }, [allowedCountryLabel, t]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refetchAddresses();

      const addressFromRoute =
        route.params?.selectedAddress || route.params?.address;
      if (addressFromRoute) {
        if (
          !addressMatchesAtHomeCountry(
            addressFromRoute as CheckoutAddress,
            allowedCountry,
          )
        ) {
          addressRestrictionToast();
          return;
        }
        setSelectedAddress(addressFromRoute);
        formik.setFieldValue(
          'address',
          formatAddress({
            line1: addressFromRoute?.line1 ?? '',
            line2: addressFromRoute?.line2 ?? '',
            landmark: addressFromRoute?.landmark ?? '',
            pincode: addressFromRoute?.pincode ?? '',
            city: String(addressFromRoute?.city ?? ''),
            country: String(addressFromRoute?.country ?? ''),
          }),
        );
        setTimeout(() => {
          formik.setFieldTouched('address', true);
        }, 100);
      }
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    navigation,
    route.params,
    refetchAddresses,
    allowedCountry,
    addressRestrictionToast,
  ]);

  const handleSelectAddress = () => {
    navigation.navigate(SCREEN_NAMES.SELECT_ADDRESS as never, {
      allowedCountryName: allowedCountry?.name,
      allowedCountryIso2: allowedCountry?.iso2,
      onSelect: (address: Address) => {
        if (
          !addressMatchesAtHomeCountry(
            address as CheckoutAddress,
            allowedCountry,
          )
        ) {
          addressRestrictionToast();
          return;
        }
        setSelectedAddress(address);
        formik.setFieldValue(
          'address',
          formatAddress({
            line1: address?.line1 ?? '',
            line2: address?.line2 ?? '',
            landmark: address?.landmark ?? '',
            pincode: address?.pincode ?? '',
            city: String(address?.city ?? ''),
            country: String(address?.country ?? ''),
          }),
        );
        setTimeout(() => {
          formik.setFieldTouched('address', true);
        }, 100);
      },
    } as never);
  };

  const loadContacts = useCallback(async (openModal: boolean) => {
    const granted = await requestContactsPermission();
    if (!granted) return;

    try {
      const contacts = await Contacts.getAll();
      const modifiedContacts: ContactListItem[] =
        contacts?.length > 0
          ? contacts.flatMap((contact: Contacts.Contact) => {
              const displayName =
                contact.displayName ||
                [contact.givenName, contact.familyName]
                  .filter(Boolean)
                  .join(' ')
                  .trim() ||
                'Unknown';
              const numbers = contact.phoneNumbers ?? [];
              return numbers
                .map((pn, index) => {
                  const phoneNumber = pn.number || '';
                  if (!phoneNumber.trim()) return null;
                  return {
                    _id: `${contact.recordID}-${index}`,
                    phoneNumber,
                    displayName,
                  };
                })
                .filter((item): item is ContactListItem => item != null);
            })
          : [];

      setContactList(modifiedContacts);
      if (openModal) {
        setShowContactModal(true);
      }
    } catch (error) {
      console.log('====contacts error====', error);
    }
  }, []);

  useEffect(() => {
    loadContacts(false);
  }, [loadContacts]);

  const applyContactPhone = useCallback(
    (item: ContactListItem) => {
      const parsed = parseContactPhoneNumber(
        item.phoneNumber,
        formik.values.phoneCountryIso2,
      );
      if (
        !phoneCountryMatchesAtHomeCountry(
          parsed.countryIso2,
          parsed.dialCode,
          allowedCountry,
        )
      ) {
        showToast({
          type: 'info',
          message: t('checkout.atHomePhoneCountryRestriction', {
            country: allowedCountryLabel || t('checkout.sameCountry'),
          }),
        });
        setShowContactModal(false);
        return;
      }
      formik.setFieldValue('phoneDialCode', parsed.dialCode);
      formik.setFieldValue('phoneCountryIso2', parsed.countryIso2);
      formik.setFieldValue('nationalNumber', parsed.nationalNumber);
      if (!formik.values.fname.trim() && item.displayName !== 'Unknown') {
        formik.setFieldValue('fname', item.displayName);
      }
      setSelectedContactId(item._id);
      setShowContactModal(false);
      setTimeout(() => {
        formik.setFieldTouched('nationalNumber', true);
      }, 100);
    },
    [allowedCountry, allowedCountryLabel, formik, t],
  );

  return (
    <Container safeArea={true}>
      <AppHeader
        title={t('checkout.otherPersonDetails') || 'Other Person Details'}
        onLeftPress={() => navigation.goBack()}
        containerStyle={styles.header}
      />

      <KeyboardFormScroll
        contentContainerStyle={styles.scrollViewContent}
        bottomOffset={SH(40)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <CustomText style={[styles.label, styles.labelFirst]}>
              {t('placeholders.fullname') || 'Full Name'}
            </CustomText>
            <CustomInput
              placeholder={t('placeholders.fullname') || 'Full Name'}
              withBackground={Colors.white}
              value={formik.values.fname}
              onChangeText={(val: string) => {
                formik.setFieldValue('fname', val);
              }}
              onBlur={() => {
                formik.setFieldTouched('fname', true);
                formik.setFieldValue('fname', formik.values.fname.trim());
              }}
              errortext={
                formik.touched.fname && formik.errors.fname
                  ? formik.errors.fname
                  : ''
              }
              keyboardType="default"
              maxLength={50}
              marginTop={SH(5)}
            />

            <CustomText style={styles.label}>
              {t('placeholders.emailId') || 'Email'}
            </CustomText>
            <CustomInput
              placeholder={t('placeholders.emailId') || 'Email'}
              withBackground={Colors.white}
              value={formik.values.email}
              onChangeText={(val: string) => {
                formik.setFieldValue('email', val);
              }}
              onBlur={() => {
                formik.setFieldTouched('email', true);
                formik.setFieldValue('email', formik.values.email.trim());
              }}
              errortext={
                formik.touched.email && formik.errors.email
                  ? formik.errors.email
                  : ''
              }
              keyboardType="email-address"
              autoCapitalize="none"
              marginTop={SH(5)}
            />

            <CustomText style={styles.label}>
              {t('placeholders.mobileno') || 'Mobile Number'}
            </CustomText>
            <PhoneCountryPicker
              marginTop={SH(5)}
              inputTheme="default"
              dialCode={formik.values.phoneDialCode}
              nationalNumber={formik.values.nationalNumber}
              onSelectionChange={(next: {
                dialCode: string;
                countryIso2: string;
              }) => {
                if (
                  !phoneCountryMatchesAtHomeCountry(
                    next.countryIso2,
                    next.dialCode,
                    allowedCountry,
                  )
                ) {
                  showToast({
                    type: 'info',
                    message: t('checkout.atHomePhoneCountryRestriction', {
                      country: allowedCountryLabel || t('checkout.sameCountry'),
                    }),
                  });
                  return;
                }
                formik.setFieldValue('phoneDialCode', next.dialCode);
                formik.setFieldValue('phoneCountryIso2', next.countryIso2);
              }}
              onNationalNumberChange={(digits: string) =>
                formik.setFieldValue('nationalNumber', digits)
              }
              onNationalBlur={() => {
                formik.setFieldTouched('nationalNumber', true);
              }}
              phonePlaceholder={t('placeholders.mobileno') || 'Mobile Number'}
              errorText={
                formik.touched.nationalNumber && formik.errors.nationalNumber
                  ? (formik.errors.nationalNumber as string)
                  : ''
              }
              contactsIcon={imagePaths.down_icon}
              contactsIconStyle={styles.contactsIcon}
              onContactsPress={() => loadContacts(true)}
            />

            <CustomText style={styles.label}>
              {addressRequired
                ? t('placeholders.selectAddress') || 'Select Address'
                : t('placeholders.selectAddressOptional') ||
                  'Select Address (optional)'}
            </CustomText>
            <TouchableOpacity onPress={handleSelectAddress} activeOpacity={0.7}>
              <CustomInput
                placeholder={
                  addressRequired
                    ? t('placeholders.selectAddress') || 'Select Address'
                    : t('placeholders.selectAddressOptional') ||
                      'Select Address (optional)'
                }
                withBackground={Colors.white}
                value={formik.values.address}
                onChangeText={() => {}}
                onBlur={() => formik.setFieldTouched('address', true)}
                errortext={
                  formik.touched.address && formik.errors.address
                    ? formik.errors.address
                    : ''
                }
                keyboardType="default"
                isEditable={false}
                marginTop={SH(5)}
                readOnly={true}
                rightIcon={imagePaths.right_icon}
              />
            </TouchableOpacity>

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
      </KeyboardFormScroll>

      <PhoneNumberPicker
        visible={showContactModal}
        onClose={() => setShowContactModal(false)}
        onSelect={applyContactPhone}
        data={contactList}
        selectedContact={selectedContactId}
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
  labelFirst: {
    marginTop: SH(5),
  },
  submitButton: {
    backgroundColor: Colors.primary,
  },
  contactsIcon: {
    width: SF(10),
    height: SF(10),
    margin: 5,
  },
});
