import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useMemo } from 'react';
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText } from '@components/common';

type ProviderLoadingStateProps = {
  message?: string;
  fullScreen?: boolean;
};

export default function ProviderLoadingState({
  message = 'Loading provider details...',
  fullScreen = false,
}: ProviderLoadingStateProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={fullScreen ? styles.fullScreenContainer : styles.container}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <CustomText
        fontSize={theme.fontSize.sm}
        fontFamily={theme.fonts.REGULAR}
        color={theme.colors.lightText}
        style={{ marginTop: theme.SH(12) }}
      >
        {message}
      </CustomText>
    </View>
  );
}

const createStyles = (theme: ThemeType) => {
  const { SH } = theme;
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: SH(40),
    },
    fullScreenContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
};
