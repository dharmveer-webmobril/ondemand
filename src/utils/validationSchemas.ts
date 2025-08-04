import * as Yup from 'yup';

export const signupValidationSchema = (t: any, regex: any) =>
  Yup.object().shape({
    fname: Yup.string()
      .required(t('validation.emptyFullName'))
      .min(3, t('validation.fullNameMinLength'))
      .matches(regex.NAME_REGEX, t('validation.validFullName')),

    email: Yup.string()
      .matches(regex.EMAIL_REGEX_WITH_EMPTY, t('validation.validEmail'))
      .required(t('validation.emptyEmail')),

    mobileno: Yup.string()
      .matches(regex.MOBIILE, t('validation.validMobile'))
      .required(t('validation.emptyMobile')),

    password: Yup.string()
      .required(t('validation.emptyPassword'))
      .matches(regex.PASSWORD, t('validation.passValid')),

    cpassword: Yup.string()
      .required(t('validation.emptyConfirmPassword'))
      .oneOf([Yup.ref('password')], t('validation.notMatchConfirmPassword')),
  });

export const loginValidationSchema = (t: any, regex: any) =>
  Yup.object().shape({
    email: Yup.string()
      .matches(regex.EMAIL_REGEX_WITH_EMPTY, t('validation.validEmail'))
      .required(t('validation.emptyEmail')),
    password: Yup.string()
      .required(t('validation.emptyPassword')),
  });



export const customerSupportValidationSchema = (t: any) =>
  Yup.object().shape({
    name: Yup.string().trim().required(t('validation.emptyFullName')),
    title: Yup.string().trim().required(t('validation.emptyTitle')),
    description: Yup.string().trim().required(t('validation.emptyDescription')),
    email: Yup.string().trim().email(t('validation.validEmail')).required(t('validation.emptyEmail')),
  });

export const profileSetupValidationSchema = (t: any, regex: any) => Yup.object().shape({
  fname: Yup.string()
    .min(3, t('validation.fullnameMinLength'))
    .required(t('validation.emptyFullName'))
    .matches(regex.NAME_REGEX, t('validation.validFullName')),
  email: Yup.string()
    .matches(regex.EMAIL_REGEX_WITH_EMPTY, t('validation.validEmail'))
    .required(t('validation.emptyEmail')),
  mobileno: Yup.string()
    .matches(regex.DIGIT_REGEX, t('validation.validMobile'))
    .min(7, t('validation.mobileMinLen'))
    .required(t('validation.emptyMobile')),
});
export const addAddressSchema = (t: any,regex:any) => Yup.object().shape({
  address: Yup.string().trim().required(t('addAddress.validation.addressEmpty')),
  appartment: Yup.string().trim().required(t('addAddress.validation.apartmentEmpty')),
  city: Yup.string().trim().required(t('addAddress.validation.cityEmpty')),
  state: Yup.string().trim().required(t('addAddress.validation.stateEmpty')),
  zipCode: Yup.string()
    .trim()
    .required(t('addAddress.validation.zipCodeEmpty'))
    .matches(regex.ZIP_CODE, t('addAddress.validation.validZipCode')),
  addressType: Yup.string().trim().required(t('addAddress.validation.addressTypeEmpty')),
});