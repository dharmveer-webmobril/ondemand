import React from 'react';
import { CountryPicker } from 'react-native-country-codes-picker';

interface Props {
  isPickerOpen: boolean;
  closeCountryPicker: () => void;
  openCountryPicker: () => void;
  onInputChange: (text: string) => void;
  inputText: string;
  countryCode: string;
  setCountryCode: (code: string) => void;
}

const CountryPickerComp: React.FC<Props> = ({
  isPickerOpen,
  closeCountryPicker,
  setCountryCode,
}) => {
  return (
    <CountryPicker
      show={isPickerOpen}
      lang="en"
      onRequestClose={closeCountryPicker}
      style={{
        modal: {
          height: '60%',
          backgroundColor: '#fff',
        },
        textInput: {
          height: 50,
          borderRadius: 3,
          color: '#000000',
        },
        countryButtonStyles: {
          height: 50,
        },
        dialCode: {
          color: '#000',
        },
        countryName: {
          color: '#000000',
        },
      }}
      pickerButtonOnPress={(item) => {
        setCountryCode(item.dial_code);
        closeCountryPicker();
      }}
    />
  );
};

export default CountryPickerComp;
