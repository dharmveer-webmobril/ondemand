import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import {
  Colors,
  Fonts,
  SF,
  SH,
} from '../../utils';
import {
  AppHeader,
  AppText,
  Container,
} from '../../component';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import RenderHtml from 'react-native-render-html';
import { useGetTermAndCondQuery } from '../../redux';

const PrivacyPolicy: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const route = useRoute<any>();
  const title = route?.params?.title;
  const [data, setData] = useState<string | null>(null);
  const { data: termAndCond, isLoading, isError } = useGetTermAndCondQuery();


  useEffect(() => {
    if (termAndCond?.data?.length > 0) {
      const content = title === 'Privacy Policy' ? termAndCond?.data[0]?.content : termAndCond?.data[1]?.content;
      setData(content);
    }
  }, [termAndCond, title]);

  return (
    <Container style={styles.container}>
      <AppHeader
        headerTitle={t(`privacyPolicy.header_${title === 'Privacy Policy' ? 'privacy_policy' : 'terms_conditions'}`)}
        onPress={() => navigation.goBack()}
        Iconname="arrowleft"
        rightOnPress={() => {}}
        headerStyle={styles.headerStyle}
        titleStyle={styles.titleStyle}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator color={Colors.red} size="large" />
          </View>
        ) : isError ? (
          <AppText style={styles.errorText}>{t('privacyPolicy.error_fetch_failed')}</AppText>
        ) : data ? (
          <RenderHtml
            contentWidth={SF(400)}
            source={{ html: data }}
          />
        ) : (
          <AppText style={styles.errorText}>{t('privacyPolicy.no_data')}</AppText>
        )}
      </ScrollView>
    </Container>
  );
};

export default PrivacyPolicy;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bgwhite,
  },
  headerStyle: {
    backgroundColor: '#ffffff',
  },
  titleStyle: {
    color: '#333',
    fontSize: SF(18),
  },
  scrollContent: {
    padding: SF(20),
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: SH(200),
  },
  errorText: {
    fontFamily: Fonts.REGULAR,
    fontSize: SF(16),
    lineHeight: SH(20),
    color: Colors.textAppColor,
    textAlign: 'center',
  },
});