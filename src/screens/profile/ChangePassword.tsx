import React from 'react';
import { Keyboard, StyleSheet, View } from 'react-native';
import { AppHeader, Container, InputField } from '../../component';
import { Colors, SH, SW } from '../../utils';
import { useNavigation } from '@react-navigation/native';
import imagePaths from '../../assets/images';
import { useTranslation } from 'react-i18next';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Buttons from '../../component/Button';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

type ChangePasswordProps = {};
const ChangePassword: React.FC<ChangePasswordProps> = ({ }) => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const validationSchema = Yup.object().shape({
    currpassword: Yup.string()
      .min(6, t('validation.passCurrMinLength'))
      .required(t('validation.emptyCurrPassword')),
    npassword: Yup.string()
      .min(6, t('validation.passNewMinLength'))
      .required(t('validation.emptyNewPassword')),
    confirmpassword: Yup.string()
      .required(t('validation.emptyConfirmPassword'))
      .oneOf([Yup.ref('password')], t('validation.notMatchConfirmPassword')),
  });
  const btnUpdatePassword = (
    values: { currpassword: string; npassword: string; confirmpassword: string },
    resetForm: any,
  ) => { };
  return (
    <Container isAuth={false} isPadding={true}>
      <AppHeader
        headerTitle={t('profile.changePassword')}
        onPress={() => {
          navigation.goBack();
        }}
        Iconname="arrowleft"
        rightOnPress={() => { }}
        headerStyle={styles.header}
      />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        extraScrollHeight={SH(40)}>
        <View style={styles.container}>
          <Formik
            initialValues={{
              currpassword: '',
              npassword: '',
              confirmpassword: '',
            }}
            validationSchema={validationSchema}
            onSubmit={(values, { resetForm }) => {
              btnUpdatePassword(values, resetForm);
            }}>
            {({
              handleChange,
              setFieldTouched,
              handleSubmit,
              values,
              errors,
              touched,
            }) => (
              <>
                <View style={{ height: '80%' }}>

                  <InputField
                    value={values.currpassword}
                    label={t('placeholders.currentPassword')}
                    onChangeText={handleChange('currpassword')}
                    onBlur={() => setFieldTouched('currpassword')}
                    // leftIcon={imagePaths.lock_icon}
                    errorMessage={touched.currpassword && errors.currpassword && errors.currpassword ? errors.currpassword : ''}
                    keyboardType={'default'}
                    color={Colors.textAppColor}
                    textColor={Colors.textAppColor}
                  />
                  <InputField
                    label={t('placeholders.newPassword')}
                    value={values.npassword}
                    onChangeText={handleChange('npassword')}
                    onBlur={() => setFieldTouched('npassword')}
                    // leftIcon={imagePaths.lock_icon}
                    errorMessage={touched.npassword && errors.npassword && errors.npassword ? errors.npassword : ''}
                    keyboardType={'default'}
                    color={Colors.textAppColor}
                    textColor={Colors.textAppColor}
                  />
                  <InputField
                    label={t('placeholders.confirmPassword')}
                    value={values.confirmpassword}
                    onChangeText={handleChange('confirmpassword')}
                    onBlur={() => setFieldTouched('confirmpassword')}
                    // leftIcon={imagePaths.lock_icon}
                    errorMessage={touched.confirmpassword && errors.confirmpassword && errors.confirmpassword ? errors.confirmpassword : ''}
                    keyboardType={'default'}
                    color={Colors.textAppColor}
                    textColor={Colors.textAppColor}
                  />
                </View>

                <Buttons
                  buttonStyle={styles.submitButton}
                  textColor={Colors.textWhite}
                  title={t('placeholders.update')}
                  onPress={() => {
                    handleSubmit();
                    Keyboard.dismiss();
                  }}
                // isLoading={true}
                />
              </>
            )}
          </Formik>
        </View>
      </KeyboardAwareScrollView>
    </Container>
  );
};

export default ChangePassword;

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
  },
  inputText: {
    color: Colors.textAppColor,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: Colors.textAppColor,
  },
  submitButton: {
    backgroundColor: Colors.themeColor,
    marginTop: SH(70),
  },
});
