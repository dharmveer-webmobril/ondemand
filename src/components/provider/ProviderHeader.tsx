import { View, StyleSheet, Pressable, } from 'react-native';
import React, { useMemo, } from 'react';
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText,  VectoreIcons, } from '@components/common';
import { goBack } from '@utils/NavigationUtils';

type ProviderHeaderProps = {
  logo?: string;
  name: string;

};

export default function ProviderHeader({
  name,
}: ProviderHeaderProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.container}>
      <Pressable onPress={() => goBack()}>
        <VectoreIcons
          name="arrow-back"
          icon="Ionicons"
          size={theme.SF(24)}
          color={theme.colors.text}
        />
      </Pressable>
      <CustomText style={styles.name} numberOfLines={2}>
        {name}
      </CustomText>
    </View>
  );
}

const createStyles = (theme: ThemeType) => {
  const { colors: Colors, SF, fonts: Fonts, SW, SH } = theme;
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors.white,
      marginBottom: SH(20),
      paddingTop: SH(10),
      paddingHorizontal: SW(15),
      gap: SW(20),
    },
    logoContainer: {
      // marginRight: SW(12),
    },
    logo: {
      width: SF(50),
      height: SF(50),
      borderRadius: SF(25),
    },
    infoContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SH(4),
    },
    name: {
      fontSize: SF(16),
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.text,
      flex: 1,
    },
   
  });
};

