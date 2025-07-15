import React from 'react';
import {
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, Fonts, handleApiError, handleApiFailureResponse, handleSuccessToast, regex, SF, SH, SW } from '../../utils';
import {
  AppText,
  AuthBottomContainer,
  AuthImgComp,
  Container,
  // CustomToast,
  InputField,

  Spacing,
  VectoreIcons,
} from '../../component';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import imagePaths from '../../assets/images';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Buttons from '../../component/Button';
import RouteName from '../../navigation/RouteName';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useForgetPasswordMutation } from '../../redux';

type ForgotProps = {};

const ForgotScreen: React.FC<ForgotProps> = ({ }) => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .matches(regex.EMAIL_REGEX_WITH_EMPTY, t('validation.validEmail'))
      .required(t('validation.emptyEmail')),
  });

  const [forgetPassword, { isLoading }] = useForgetPasswordMutation();

  const btnForgot = async (values: { email: string }, resetForm: any) => {
    let userData = {
      email: values.email,
    };
    console.log(userData);

    try {
      const response = await forgetPassword(userData).unwrap();
      console.log('Verify OTP Response:', response);
      if (response.success) {
        handleSuccessToast(response.message);
        const token = response?.data?.accessToken?.accessToken || response?.data?.accessToken;
        navigation.navigate(RouteName.OTP_VERIFY, { fromScreen: 'forgotpass', userToken: token, email: values.email });
        resetForm()
      } else {
        handleApiFailureResponse(response,);
      }
    } catch (error: any) {
      handleApiError(error);
    }
  };

  const backButton = () => {
    return <TouchableOpacity style={{ padding: 5, position: 'absolute', top: SF(20), left: SF(20), zIndex: 9999 }} onPress={() => { navigation.goBack() }}>
      <VectoreIcons
        icon="FontAwesome"
        name={'angle-left'}
        size={SF(30)}
        color={Colors.textHeader}
      />
    </TouchableOpacity>
  }
  return (
    <Container
      isAuth={true}
      isBackButton={true}
      onBackPress={() => {
        navigation.goBack();
      }}
      style={styles.container}>
      {
        backButton()
      }
      <KeyboardAwareScrollView
        bounces={false}
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 0 }}
        showsVerticalScrollIndicator={false}
        extraScrollHeight={SH(40)}>
        <Spacing space={SH(40)} />
        <AuthImgComp icon={imagePaths.forgot_img} />
        <Spacing space={SH(25)} />
        <AuthBottomContainer>
          <Formik
            initialValues={{ email: '' }}
            validationSchema={validationSchema}
            onSubmit={(values, { resetForm }) => {
              btnForgot(values, resetForm);
            }}>
            {({
              handleChange,
              setFieldValue,
              handleSubmit,
              values,
              errors,
              touched,
            }) => (
              <View style={styles.bottomInnerContainer}>
                <View>
                  <AppText style={styles.heading}>{t('forgotpass.forgotPassword')}</AppText>
                  <AppText style={styles.subtitile}>
                    {t('forgotpass.subtitle')}
                  </AppText>
                  <InputField
                    placeholder={t('placeholders.email')}
                    value={values.email}
                    onChangeText={handleChange('email')}
                    onBlur={() => setFieldValue('email', values.email.trim())}
                    leftIcon={imagePaths.email_icon}
                    errorMessage={touched.email && errors.email && errors.email ? errors.email : ''}
                    keyboardType={'email-address'}
                  />
                </View>

                <Buttons
                  buttonStyle={styles.brnContainer}
                  textColor={Colors.themeColor}
                  title={t('forgotpass.sendotp')}
                  onPress={() => {
                    handleSubmit();
                    Keyboard.dismiss();
                  }}
                  isLoading={isLoading}
                />
              </View>
            )}
          </Formik>
        </AuthBottomContainer>
      </KeyboardAwareScrollView>
    </Container>
  );
};

export default ForgotScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bgwhite,
  },
  brnContainer: { backgroundColor: Colors.bgwhite, marginTop: SH(160), width: '93%', alignSelf: 'center' },
  subtitile: {
    color: Colors.textWhite,
    fontFamily: Fonts.REGULAR,
    fontSize: SF(14),
    textAlign: 'center',
    margin: SH(20),
    marginBottom: SH(30),
  },
  heading: {
    color: Colors.textWhite,
    fontFamily: Fonts.SEMI_BOLD,
    fontSize: SF(20),
    textAlign: 'center',
  },
  bottomInnerContainer: {
    paddingVertical: SH(35),
    paddingHorizontal: SW(25),
    height: '100%',
  },
});
