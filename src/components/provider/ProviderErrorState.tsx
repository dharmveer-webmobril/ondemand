import { View, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText, CustomButton } from '@components/common';

type ProviderErrorStateProps = {
  errorMessage: string;
  onRetry: () => void;
  fullScreen?: boolean;
};

export default function ProviderErrorState({
  errorMessage,
  onRetry,
  fullScreen = false,
}: ProviderErrorStateProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={fullScreen ? styles.fullScreenContainer : styles.container}>
      <CustomText
        fontSize={fullScreen ? theme.fontSize.lg : theme.fontSize.md}
        fontFamily={theme.fonts.SEMI_BOLD}
        color={theme.colors.red}
        textAlign="center"
        style={{ marginBottom: theme.SH(8) }}
      >
        {fullScreen ? 'Error Loading Provider' : errorMessage}
      </CustomText>
      {fullScreen && (
        <CustomText
          fontSize={theme.fontSize.sm}
          fontFamily={theme.fonts.REGULAR}
          color={theme.colors.lightText}
          textAlign="center"
          style={{ marginBottom: theme.SH(20) }}
        >
          {errorMessage}
        </CustomText>
      )}
      <CustomButton
        title="Retry"
        onPress={onRetry}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
        buttonStyle={styles.retryButton}
      />
    </View>
  );
}

const createStyles = (theme: ThemeType) => {
  const { colors: Colors, SH, SW } = theme;
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: SW(20),
      paddingVertical: SH(40),
    },
    fullScreenContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: SW(20),
    },
    retryButton: {
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: SW(24),
    },
  });
};
