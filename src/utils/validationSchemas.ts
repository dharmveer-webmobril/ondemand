import * as Yup from 'yup';
import regex from './regexList';

export const addAddressSchema = (t: any, regexList: typeof regex) => {
  return Yup.object().shape({
    name: Yup.string()
      .trim()
      .min(2, t('addAddress.validation.nameMinLength') || 'Name must be at least 2 characters')
      .required(t('addAddress.validation.nameEmpty') || 'Name is required'),
    line1: Yup.string()
      .trim()
      .min(5, t('addAddress.validation.line1MinLength') || 'Address must be at least 5 characters')
      .required(t('addAddress.validation.line1Empty') || 'Street address is required'),
    line2: Yup.string()
      .trim()
      .optional(),
    landmark: Yup.string()
      .trim()
      .optional(),
    city: Yup.string()
      .required(t('addAddress.validation.cityEmpty') || 'City is required'),
    country: Yup.string()
      .required(t('addAddress.validation.countryEmpty') || 'Country is required'),
    pincode: Yup.string()
      .trim()
      .matches(regexList.ZIP_CODE, t('addAddress.validation.validPincode') || 'Please enter a valid pincode')
      .required(t('addAddress.validation.pincodeEmpty') || 'Pincode is required'),
    // contact: Yup.string()
    //   .trim()
    //   .matches(regexList.MOBILE, t('validation.validMobile') || 'Please enter a valid mobile number')
    //   .required(t('validation.emptyMobile') || 'Contact number is required'),
    addressType: Yup.string()
      .oneOf(['home', 'office', 'other'], t('addAddress.validation.validAddressType') || 'Please select a valid address type')
      .required(t('addAddress.validation.addressTypeEmpty') || 'Address type is required'),
  });
};
