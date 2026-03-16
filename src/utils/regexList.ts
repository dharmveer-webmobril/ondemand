const regex = {
    NAME_REGEX: /^[a-zA-Z ]+$/,
    EMAIL_REGEX_WITH_EMPTY: /^$|^(?=.*[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})/,
    MOBILE_NUMBER_WITH_COUNTRY_CODE_REGEX: /\+(9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3[875]\d|2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|4[987654310]|3[9643210]|2[70]|7|1)\d{1,14}$/,
    PASSWORD_REGEX: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/,
    DIGIT_REGEX: /^\d*$/,
    ALPHA: /^[a-zA-Z ]*$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[|)(@\<{}>[\]/$!%*?:;.,=&_#~"'`^+-])[A-Za-z\d|)(@\<{}>[\]/$!%*?:;.,=&_#~"'`^+-]{8,16}$/,
    ALPHA_NEMERIC: /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9 ]*$/,
    ADDRESS: /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9_@./#&,() ]*$/,
    GST: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    PAN: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    PPOSITIVE_INTEGER: /^[1-9]\d*$/,
    ZIP_CODE: /^[A-Za-z0-9\s-]{3,12}$/,
    MOBILE: /^[1-9][0-9]{6,14}$/,

    // Withdraw / bank details (multi-country: IFSC, SWIFT, IBAN, routing, etc.)
    /** Positive amount with optional 1-2 decimal places */
    AMOUNT_POSITIVE_DECIMAL: /^[0-9]+(\.[0-9]{1,2})?$/,
    /** Account holder name: letters, spaces, dots, apostrophe, hyphen (Latin + common accents) */
    ACCOUNT_HOLDER_NAME: /^[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF\s.'\-]+$/,
    /** Bank name: letters, numbers, spaces, common punctuation */
    BANK_NAME: /^[a-zA-Z0-9\u00C0-\u024F\s.'\-&()]+$/,
    /** Bank account number: alphanumeric, spaces, hyphens (IBAN, local account numbers) */
    BANK_ACCOUNT_NUMBER: /^[A-Za-z0-9\s\-]{6,34}$/,
    /** Bank code: IFSC (11), SWIFT/BIC (8 or 11), routing (9), sort code, etc. */
    BANK_CODE: /^[A-Za-z0-9]{6,17}$/,
}
export default regex