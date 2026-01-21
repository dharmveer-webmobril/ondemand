import { View, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText } from '@components/common';

type ProviderEmptyStateProps = {
  message: string;
};

export default function ProviderEmptyState({ message }: ProviderEmptyStateProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <CustomText
        fontSize={theme.fontSize.md}
        fontFamily={theme.fonts.REGULAR}
        color={theme.colors.lightText}
        textAlign="center"
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
  });
};
