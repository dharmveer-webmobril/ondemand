import { View, StyleSheet, Pressable, Platform } from 'react-native'
import React, { useMemo, useState } from 'react'
import { Container, AppHeader, CustomButton, CustomInput, CustomText, VectoreIcons } from '@components';
import { ThemeType, useThemeContext } from '@utils/theme';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function AddAddress() {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const mode = (route.params as any)?.mode || 'add';
  const isEditMode = mode === 'edit';

  const [streetAddress, setStreetAddress] = useState('dfferg rge trers');
  const [apartment, setApartment] = useState('123/5 area no.');
  const [city, setCity] = useState('city name');
  const [zipCode, setZipCode] = useState('452010');
  const [isDefault, setIsDefault] = useState(false);

  const handleUseCurrentLocation = () => {
    // Handle location logic here
    console.log('Use current location');
  };

  const handleSave = () => {
    // Handle save logic here
    console.log('Save address:', { streetAddress, apartment, city, zipCode, isDefault });
    navigation.goBack();
  };

  return (
    <Container safeArea={true} style={styles.container}>
      <AppHeader
        title={isEditMode ? t('addAddress.edittitle') : t('addAddress.title')}
        onLeftPress={() => navigation.goBack()}
      />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        extraScrollHeight={theme.SH(40)}>

        {/* Use Current Location */}
        <Pressable style={styles.locationButton} onPress={handleUseCurrentLocation}>
          <VectoreIcons
            name="location"
            size={theme.SF(20)}
            icon="Ionicons"
            color={theme.colors.primary}
          />
          <CustomText style={styles.locationText}>
            {t('addAddress.useMyCurrentLocation')}
          </CustomText>
          <VectoreIcons
            name="chevron-forward"
            size={theme.SF(20)}
            icon="Ionicons"
            color={theme.colors.lightText}
          />
        </Pressable>

        {/* Input Fields */}
        <View style={styles.inputSection}>
          <View style={styles.inputWrapper}>
            <CustomText
              variant="h5"
              style={styles.label}
              fontFamily={theme.fonts.MEDIUM}
            >
              {t('addAddress.placeholders.streetAddress')}
            </CustomText>
            <CustomInput
              placeholder={t('addAddress.placeholders.streetAddress')}
              value={streetAddress}
              onChangeText={setStreetAddress}
              withBackground={theme.colors.white}
              marginTop={theme.SH(8)}
            />
          </View>

          <View style={styles.inputWrapper}>
            <CustomText
              variant="h5"
              style={styles.label}
              fontFamily={theme.fonts.MEDIUM}
            >
              {t('addAddress.placeholders.apartment')}
            </CustomText>
            <CustomInput
              placeholder={t('addAddress.placeholders.apartment')}
              value={apartment}
              onChangeText={setApartment}
              withBackground={theme.colors.white}
              marginTop={theme.SH(8)}
            />
          </View>

          <View style={styles.inputWrapper}>
            <CustomText
              variant="h5"
              style={styles.label}
              fontFamily={theme.fonts.MEDIUM}
            >
              {t('addAddress.placeholders.city')}
            </CustomText>
            <CustomInput
              placeholder={t('addAddress.placeholders.city')}
              value={city}
              onChangeText={setCity}
              withBackground={theme.colors.white}
              marginTop={theme.SH(8)}
            />
          </View>

          <View style={styles.inputWrapper}>
            <CustomText
              variant="h5"
              style={styles.label}
              fontFamily={theme.fonts.MEDIUM}
            >
              {t('addAddress.placeholders.zipCode')}
            </CustomText>
            <CustomInput
              placeholder={t('addAddress.placeholders.zipCode')}
              value={zipCode}
              onChangeText={setZipCode}
              keyboardType="numeric"
              withBackground={theme.colors.white}
              marginTop={theme.SH(8)}
            />
          </View>

          {/* Checkbox */}
          <Pressable
            style={styles.checkboxContainer}
            onPress={() => setIsDefault(!isDefault)}
          >
            <View style={[styles.checkbox, isDefault && styles.checkboxChecked]}>
              {isDefault && (
                <VectoreIcons
                  name="checkmark"
                  size={theme.SF(16)}
                  icon="Ionicons"
                  color={theme.colors.white}
                />
              )}
            </View>
            <CustomText style={styles.checkboxLabel}>
              {t('addAddress.makeThisDefault')}
            </CustomText>
          </Pressable>
        </View>

        <CustomButton
          title={t('addAddress.placeholders.save')}
          onPress={handleSave}
          backgroundColor={theme.colors.primary}
          textColor={theme.colors.white}
          buttonStyle={styles.saveButton}
        />
      </KeyboardAwareScrollView>
      {/* Save Button */}
 
    </Container>
  );
}

const createStyles = (theme: ThemeType) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background || '#F7F7F7',
    paddingHorizontal: theme.SW(20),
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: theme.SH(20),
    // paddingBottom: theme.SH(100),
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.SW(16),
    paddingVertical: theme.SH(16),
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.SH(20),
    borderWidth: 1,
    borderColor: theme.colors.secondary || '#EAEAEA',
  },
  locationText: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontFamily: theme.fonts.MEDIUM,
    marginLeft: theme.SW(12),
  },
  inputSection: {
    width: '100%',
  },
  inputWrapper: {
    marginBottom: theme.SH(20),
  },
  label: {
    color: theme.colors.text,
    marginBottom: theme.SH(4),
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.SH(10),
    marginBottom: theme.SH(20),
  },
  checkbox: {
    width: theme.SF(24),
    height: theme.SF(24),
    borderRadius: theme.SF(4),
    borderWidth: 2,
    borderColor: theme.colors.textInputBorder,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.SW(12),
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkboxLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontFamily: theme.fonts.MEDIUM,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: theme.SW(20),
    paddingBottom: Platform.OS === 'ios' ? theme.SH(20) : theme.SH(30),
    paddingTop: theme.SH(16),
    backgroundColor: theme.colors.background || '#F7F7F7',
    borderTopWidth: 1,
    borderTopColor: theme.colors.secondary || '#EAEAEA',
  },
  saveButton: {
    borderRadius: theme.borderRadius.md,
    height: theme.SF(45),
     marginTop: theme.SH(80),
  },
});

