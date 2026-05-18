import React, { useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { AppHeader, Container } from '@components/common';
import { useThemeContext } from '@utils/theme';

type RouteParams = {
  trackingUrl: string;
  title?: string;
};

export default function TrackingWebViewScreen() {
  const theme = useThemeContext();
  const route = useRoute<any>();
  const navigation = useNavigation();
  const styles = useMemo(() => createStyles(), []);

  const { trackingUrl, title = 'Track Member' } = (route.params || {}) as RouteParams;

  if (!trackingUrl) {
    return null;
  }

  return (
    <Container safeArea={true} style={styles.container}>
      <AppHeader
        title={title}
        onLeftPress={() => navigation.goBack()}
        backgroundColor={theme.colors.background}
        tintColor={theme.colors.text}
        containerStyle={{ paddingLeft: 20, paddingRight: 20 }}
      />
      <View style={styles.webviewWrap}>
        <WebView
          source={{ uri: trackingUrl }}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          )}
          style={styles.webview}
        />
      </View>
    </Container>
  );
}

const createStyles = () =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    webviewWrap: {
      flex: 1,
    },
    webview: {
      flex: 1,
    },
    loading: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
