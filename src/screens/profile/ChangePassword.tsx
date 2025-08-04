import React, { useState } from 'react';
import { Keyboard, StyleSheet, View } from 'react-native';
import { AppHeader, Container, InputField } from '../../component';
import {
  Colors,
  handleApiError,
  handleApiFailureResponse,
  handleSuccessToast,
  regex,
  SH,
  SW,
} from '../../utils';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Buttons from '../../component/Button';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useChangePassordMutation } from '../../redux';
import imagePaths from '../../assets/images';

type ChangePasswordProps = {};

const ChangePassword: React.FC<ChangePasswordProps> = ({}) => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const [showCurrPass, setShowCurrPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [changePassord, { isLoading }] = useChangePassordMutation();

  const validationSchema = Yup.object().shape({
    currpassword: Yup.string()
      .required(t('validation.emptyCurrPassword'))
      .matches(regex.PASSWORD, t('validation.passValid')),
    npassword: Yup.string()
      .required(t('validation.emptyNewPassword'))
      .matches(regex.PASSWORD, t('validation.passValid')),
    confirmpassword: Yup.string()
      .required(t('validation.emptyConfirmPassword'))
      .oneOf([Yup.ref('npassword')], t('validation.notMatchConfirmPassword')),
  });

  const btnUpdatePassword = async (
    values: { currpassword: string; npassword: string; confirmpassword: string },
    resetForm: any
  ) => {
    try {
      const userData = {
        old_password: values.currpassword,
        new_password: values.npassword,
      };

      console.log('Change Password Payload:', userData);

      const response = await changePassord(userData).unwrap();

      if (response.success) {
        handleSuccessToast(response.message || t('messages.passwordUpdated'));
        resetForm();
        navigation.goBack();
      } else {
        handleApiFailureResponse(response, t('messages.passwordChangeFailed'));
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  return (
    <Container isAuth={false} isPadding={true}>
      <AppHeader
        headerTitle={t('profile.changePassword')}
        onPress={() => navigation.goBack()}
        Iconname="arrowleft"
        rightOnPress={() => {}}
        headerStyle={styles.header}
      />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        extraScrollHeight={SH(40)}>
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
              <View style={styles.inputContainer}>
                <InputField
                  label={t('placeholders.currentPassword')}
                  value={values.currpassword}
                  onChangeText={handleChange('currpassword')}
                  onBlur={() => setFieldTouched('currpassword')}
                  secureTextEntry={!showCurrPass}
                  rightIcon={!showCurrPass ? imagePaths.eye_off_icon : imagePaths.eye_open}
                  onRightIconPress={() => setShowCurrPass(!showCurrPass)}
                  errorMessage={
                    touched.currpassword && errors.currpassword
                      ? errors.currpassword
                      : ''
                  }
                  keyboardType="default"
                  color={Colors.textAppColor}
                  textColor={Colors.textAppColor}
                />

                <InputField
                  label={t('placeholders.newPassword')}
                  value={values.npassword}
                  onChangeText={handleChange('npassword')}
                  onBlur={() => setFieldTouched('npassword')}
                  secureTextEntry={!showNewPass}
                  rightIcon={!showNewPass ? imagePaths.eye_off_icon : imagePaths.eye_open}
                  onRightIconPress={() => setShowNewPass(!showNewPass)}
                  errorMessage={
                    touched.npassword && errors.npassword
                      ? errors.npassword
                      : ''
                  }
                  keyboardType="default"
                  color={Colors.textAppColor}
                  textColor={Colors.textAppColor}
                />

                <InputField
                  label={t('placeholders.confirmPassword')}
                  value={values.confirmpassword}
                  onChangeText={handleChange('confirmpassword')}
                  onBlur={() => setFieldTouched('confirmpassword')}
                  secureTextEntry={!showConfirmPass}
                  rightIcon={
                    !showConfirmPass
                      ? imagePaths.eye_off_icon
                      : imagePaths.eye_open
                  }
                  onRightIconPress={() => setShowConfirmPass(!showConfirmPass)}
                  errorMessage={
                    touched.confirmpassword && errors.confirmpassword
                      ? errors.confirmpassword
                      : ''
                  }
                  keyboardType="default"
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
                isLoading={isLoading}
              />
            </>
          )}
        </Formik>
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
  inputContainer: {
    borderColor: Colors.textAppColor,
    flex: 1,
    paddingHorizontal: SW(25),
    paddingVertical: SH(20),
  },
  submitButton: {
    backgroundColor: Colors.themeColor,
    marginTop: SH(70),
    marginBottom: SH(25),
    width: '86%',
    alignSelf: 'center',
  },
});
