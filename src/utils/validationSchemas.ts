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

export interface WithdrawRequestFormValues {
  amount: string;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
}

export const withdrawRequestSchema = (
  t: (key: string) => string,
  regexList: typeof regex,
  maxAmount: number
) =>
  Yup.object().shape({
    amount: Yup.string()
      .trim()
      .required(t('wallet.validation.emptyAmount'))
      .test('valid-amount', t('wallet.validation.validAmount'), (val) => {
        if (!val) return false;
        const num = parseFloat(val);
        return Number.isFinite(num) && num > 0 && regexList.AMOUNT_POSITIVE_DECIMAL.test(val);
      })
      .test('max-amount', t('wallet.withdrawExceedsBalance'), (val) => {
        if (!val) return true;
        const num = parseFloat(val);
        return Number.isFinite(num) && num <= maxAmount;
      }),
    accountHolderName: Yup.string()
      .trim()
      .required(t('wallet.validation.emptyAccountHolderName'))
      .min(2, t('wallet.validation.minAccountHolderName'))
      .matches(regexList.ACCOUNT_HOLDER_NAME, t('wallet.validation.validAccountHolderName')),
    bankName: Yup.string()
      .trim()
      .required(t('wallet.validation.emptyBankName'))
      .min(2, t('wallet.validation.minBankName'))
      .matches(regexList.BANK_NAME, t('wallet.validation.validBankName')),
    accountNumber: Yup.string()
      .trim()
      .required(t('wallet.validation.emptyAccountNumber'))
      .matches(regexList.BANK_ACCOUNT_NUMBER, t('wallet.validation.validAccountNumber')),
    ifscCode: Yup.string()
      .trim()
      .required(t('wallet.validation.emptyBankCode'))
      .matches(regexList.BANK_CODE, t('wallet.validation.validBankCode')),
  });
