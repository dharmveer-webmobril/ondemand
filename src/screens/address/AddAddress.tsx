import React, { useState } from 'react';
import {
  Keyboard,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
} from 'react-native';
import {
  AppHeader,
  Container,
  ImageLoader,
  Spacing,
  Buttons,
  InputField,
  AppText,
  VectoreIcons,
  Checkbox
} from '../../component';
import { Colors, Fonts, goBack, regex, SF, SH, SW } from '../../utils';
import { useNavigation, useRoute } from '@react-navigation/native';
import imagePaths from '../../assets/images';
import { useTranslation } from 'react-i18next';
import VectorIcon from '../../component/VectoreIcons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const AddAddress = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const [address, setAddress] = useState('');
  const [appartment, setAppartment] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const route = useRoute<any>();
  const { prevScreen } = route.params;

  const [errors, setErrors] = useState<{ address?: string; appartment?: string; city?: string, zipCode?: string }>({});

  const validateInputs = () => {
    let valid = true;
    const newErrors: typeof errors = {};

    if (!address?.trim()) {
      newErrors.address = t('validation.addressEmpty');
      valid = false;
    }
    if (!appartment?.trim()) {
      newErrors.appartment = t('validation.apartmentEmpty');
      valid = false;
    }
    if (!city?.trim()) {
      newErrors.city = t('validation.cityEmpty');
      valid = false;
    }


    if (!zipCode?.trim()) {
      newErrors.zipCode = t('validation.zipodeEmpty');
      valid = false;
    }
    // else if (!regex.ZIP_CODE.test(zipCode.trim())) {
    //   newErrors.zipCode = t('validation.validFullName');
    //   valid = false;
    // }


    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = () => {
    Keyboard.dismiss();
    if (validateInputs()) {
      goBack()
    }
  };

  return (
    <Container isPadding={false}>
      <AppHeader
        headerTitle={t('addAddress.title')}
        onPress={() => navigation.goBack()}
        Iconname="arrowleft"
        headerStyle={styles.header}
      />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        extraScrollHeight={SH(40)}
      >
        <View style={styles.container}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: 'center', marginBottom: 10 }}>
            <AppText style={{ color: Colors.themeColor, fontFamily: Fonts.SEMI_BOLD }}>
              <VectoreIcons size={SF(14)} color={Colors.themeColor} icon='FontAwesome6' name='location-dot' />    {t('addAddress.useMyCurrentLocation')}
            </AppText>
            <VectoreIcons size={SF(26)} color={Colors.themeColor} icon='Feather' name='chevron-right' />
          </View>
          <InputField
            label={t('placeholders.streetAddress')}
            value={address}
            onChangeText={setAddress}
            onBlur={() => setAddress(address.trim())}
            errorMessage={errors.address || ''}
            keyboardType="default"
            color={Colors.textAppColor}
            textColor={Colors.textAppColor}
          />

          <InputField
            label={t('placeholders.Apartment')}
            value={appartment}
            onChangeText={setAppartment}
            onBlur={() => setAppartment(appartment.trim())}
            errorMessage={errors.appartment || ''}
            keyboardType="default"
            color={Colors.textAppColor}
            textColor={Colors.textAppColor}
          />

          <InputField
            label={t('placeholders.City')}
            value={city}
            onChangeText={setCity}
            onBlur={() => setCity(city.trim())}
            errorMessage={errors.city || ''}
            keyboardType="default"
            color={Colors.textAppColor}
            textColor={Colors.textAppColor}
          />
          <InputField
            label={t('placeholders.zipCode')}
            value={zipCode}
            onChangeText={setZipCode}
            onBlur={() => setZipCode(zipCode.trim())}
            errorMessage={errors.zipCode || ''}
            keyboardType="default"
            color={Colors.textAppColor}
            textColor={Colors.textAppColor}
          />
        </View>
        <View style={{
          paddingHorizontal: SW(25),
          paddingVertical: SH(20),
        }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: 'center', marginBottom: 10, backgroundColor: '#F2F2F2', padding: 8, borderRadius: 10, paddingLeft: SW(15) }}>
            <Checkbox
              checked={true}
              onChange={() => { }}
              size={SF(14)}
              label={t('addAddress.makeThisDefault')}
            />
          </View>
          <Buttons
            buttonStyle={styles.submitButton}
            textColor={Colors.textWhite}
            title={t('placeholders.save')}
            onPress={handleSubmit}
          />
        </View>
      </KeyboardAwareScrollView>
    </Container>
  );
};

export default AddAddress;

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
    flex: 1
  },
  profileContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SH(20),
  },
  userConImage: {
    width: SF(70),
    height: SF(70),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.borderColor,
    borderRadius: SF(35),
  },
  userImage: {
    width: SF(66),
    height: SF(66),
    borderRadius: SF(33),
  },
  editIcon: {
    position: 'absolute',
    zIndex: 99,
    padding: 5,
    right: -5,
    bottom: 0,
    borderRadius: 6,
    backgroundColor: Colors.themeColor,
  },
  userInfo: {
    marginTop: 10,
  },
  userName: {
    fontFamily: Fonts.MEDIUM,
    fontSize: SF(16),
  },
  userPhone: {
    fontFamily: Fonts.REGULAR,
    fontSize: SF(12),
    marginTop: SH(5),
  },
  addressContainer: {
    borderRadius: SW(10),
    paddingVertical: SW(15),
    paddingHorizontal: SW(15),
    borderWidth: 1,
    borderColor: Colors.textAppColor,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addressInfo: {
    width: '80%',
  },
  addressName: {
    fontFamily: Fonts.SEMI_BOLD,
    fontSize: SF(12),
  },
  addressDetail: {
    fontFamily: Fonts.REGULAR,
    fontSize: SF(12),
    marginTop: SH(4),
  },
  addressMoreIcon: {
    paddingVertical: 5,
    paddingLeft: 5,
  },
  addAddressButton: {
    backgroundColor: Colors.themeColor,
    height: SF(28),
    width: SF(124),
    marginTop: 15,
    alignSelf: 'flex-end',
    borderRadius: 5,
  },
  addAddressText: {
    fontSize: SF(12),
  },
  submitButton: {
    backgroundColor: Colors.themeColor,
    marginTop: SH(30),
  },
});
