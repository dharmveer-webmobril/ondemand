import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { CustomText, VectoreIcons } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';

type AddressCardProps = {
  address: string;
  onViewLocation: () => void;
};

export default function AddressCard({
  address,
  onViewLocation,
}: AddressCardProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (!address) return null;

  return (
    <View style={styles.card}>
      <View style={styles.titleContainer}>
        <CustomText
          fontSize={theme.SF(15)}
          fontFamily={theme.fonts.SEMI_BOLD}
          color={theme.colors.text}
          marginBottom={theme.SH(12)}
        >
          Service Address
        </CustomText>
        <Pressable onPress={onViewLocation}>
          <VectoreIcons
            name="directions"
            icon="FontAwesome5"
            size={theme.SF(24)}
            color={theme.colors.primary}
          />
        </Pressable>
      </View>
      <Pressable style={styles.detailRow}>
        <VectoreIcons
          name="location-outline"
          icon="Ionicons"
          size={theme.SF(18)}
          color={theme.colors.lightText}
        />
        <View style={styles.addressContainer}>
          <CustomText
            fontSize={theme.fontSize.sm}
            fontFamily={theme.fonts.REGULAR}
            color={theme.colors.text}
            style={styles.detailText}
          >
            {address}
          </CustomText>
        </View>
      </Pressable>
    </View>
  );
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.SW(16),
      paddingVertical: theme.SH(10),
      marginBottom: theme.SH(10),
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    addressContainer: {
      flex: 1,
      marginLeft: theme.SW(12),
    },
    detailText: {
      flex: 1,
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.SH(10),
    },
  });
