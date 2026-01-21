import { View, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomButton } from '@components/common';

type ProviderBookButtonProps = {
  onPress: () => void;
  title?: string;
};

export default function ProviderBookButton({
  onPress,
  title = 'Book Service',
}: ProviderBookButtonProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <CustomButton
        title={title}
        onPress={onPress}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
        buttonStyle={styles.button}
        buttonTextStyle={styles.buttonText}
      />
    </View>
  );
}

const createStyles = (theme: ThemeType) => {
  const { SW, SH } = theme;
  return StyleSheet.create({
    container: {
      paddingHorizontal: SW(20),
      paddingVertical: SH(10),
    },
    button: {
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: SW(24),
      borderWidth: 2,
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.white,
    },
    buttonText: {
      color: theme.colors.primary,
    },
  });
};
