
import React from 'react';
import { View, StyleSheet, Keyboard } from 'react-native';
import { useFormik } from 'formik';
import { useNavigation } from '@react-navigation/native';
import {
  AppHeader,
  AppText,
  Buttons,
  Container,
  InputField,
} from '../../component';
import {
  Colors,
  customerSupportValidationSchema,
  Fonts,
  handleApiError,
  handleApiFailureResponse,
  handleSuccessToast,
  SF,
  SH,
  SW,
} from '../../utils';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSelector } from 'react-redux';
import { RootState, useSubmitCustomerSupportMutation } from '../../redux';
import { useTranslation } from 'react-i18next';

interface FormValues {
  name: string;
  title: string;
  description: string;
  email: string;
}

const CustomerSupport: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const user = useSelector((state: RootState) => state.auth.user);
  console.log('-----user-----', user);

  const [submitCustomerSupport, { isLoading: isSubmitting }] = useSubmitCustomerSupportMutation();

  const formik = useFormik<FormValues>({
    initialValues: {
      name: user?.fullName || '',
      title: '',
      description: '',
      email: user?.email || '',
    },
    validationSchema: customerSupportValidationSchema(t),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      Keyboard.dismiss();
      try {
        const response = await submitCustomerSupport({
          data: {
            name: values.name,
            title: values.title,
            query: values.description,
            email: values.email,
          },
        }).unwrap();

        if (response.success) {
          handleSuccessToast( t('customerSupport.messages.success'))
          resetForm();
          navigation.goBack();
        } else {
          handleApiFailureResponse(response, t('customerSupport.messages.error'));
        }
      } catch (error) {
        handleApiError(error, t('customerSupport.messages.error'));
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Container isPadding={false}>
      <AppHeader
        headerTitle={t('customerSupport.header')}
        onPress={() => navigation.goBack()}
        Iconname="arrowleft"
        headerStyle={styles.header}
      />
      <KeyboardAwareScrollView
        style={styles.scrollStyle}
        contentContainerStyle={styles.container}
        enableOnAndroid
        extraScrollHeight={50}
        keyboardShouldPersistTaps="handled"
      >
        <AppText style={styles.formLabel}>{t('customerSupport.formLabel')}</AppText>
        <View style={styles.inputWrapper}>
          <InputField
            placeholder={t('customerSupport.placeholder.name')}
            value={formik.values.name}
            onChangeText={(val) => formik.setFieldValue('name', val)}
            onBlur={() => formik.setFieldTouched('name', true)}
            errorMessage={formik.touched.name && formik.errors.name ? formik.errors.name : ''}
            placeholderTextColor={Colors.textAppColor}
            textColor={Colors.textAppColor}
            withBackground
          />
          <InputField
            placeholder={t('customerSupport.placeholder.email')}
            keyboardType="email-address"
            value={formik.values.email}
            onChangeText={(val) => formik.setFieldValue('email', val)}
            onBlur={() => formik.setFieldTouched('email', true)}
            errorMessage={formik.touched.email && formik.errors.email ? formik.errors.email : ''}
            placeholderTextColor={Colors.textAppColor}
            textColor={Colors.textAppColor}
            withBackground
          />
          <InputField
            placeholder={t('customerSupport.placeholder.title')}
            value={formik.values.title}
            onChangeText={(val) => formik.setFieldValue('title', val)}
            onBlur={() => formik.setFieldTouched('title', true)}
            errorMessage={formik.touched.title && formik.errors.title ? formik.errors.title : ''}
            placeholderTextColor={Colors.textAppColor}
            textColor={Colors.textAppColor}
            withBackground
          />
          <InputField
            placeholder={t('customerSupport.placeholder.description')}
            multiline
            value={formik.values.description}
            onChangeText={(val) => formik.setFieldValue('description', val)}
            onBlur={() => formik.setFieldTouched('description', true)}
            errorMessage={
              formik.touched.description && formik.errors.description ? formik.errors.description : ''
            }
            placeholderTextColor={Colors.textAppColor}
            textColor={Colors.textAppColor}
            withBackground
            inputContainer={styles.descriptionInputContainer}
          />
        </View>
        <Buttons
          buttonStyle={styles.submitButton}
          textColor={Colors.textWhite}
          title={t('customerSupport.button.submit')}
          onPress={formik.handleSubmit}
          isLoading={isSubmitting}
        />
      </KeyboardAwareScrollView>
    </Container>
  );
};

export default CustomerSupport;

const styles = StyleSheet.create({
  scrollStyle: {
    flexGrow: 1,
  },
  container: {
    paddingHorizontal: SW(25),
    flexGrow: 1,
  },
  header: {
    backgroundColor: Colors.bgwhite,
    paddingHorizontal: SW(30),
    marginTop: SH(10),
  },
  formLabel: {
    fontSize: SF(16),
    fontFamily: Fonts.SEMI_BOLD,
    color: Colors.textAppColor,
    marginTop: SH(20),
  },
  inputWrapper: {
    backgroundColor: Colors.themelight,
    marginTop: SH(20),
    borderRadius: SF(10),
    paddingHorizontal: SW(10),
    paddingTop: SH(10),
    paddingBottom: SH(20),
  },
  descriptionInputContainer: {
    height: SH(100),
  },
  submitButton: {
    backgroundColor: Colors.themeColor,
    marginTop: SH(50),
  },
  errorText: {
    fontSize: SF(12),
    color: Colors.red,
    marginTop: SH(5),
    fontFamily: Fonts.REGULAR,
  },
})