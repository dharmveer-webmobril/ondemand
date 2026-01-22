import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { CustomText, VectoreIcons } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';

type OtherPersonDetailsCardProps = {
  name: string;
  email: string;
  contact: string;
  onCall: (phone: string) => void;
};

export default function OtherPersonDetailsCard({
  name,
  email,
  contact,
  onCall,
}: OtherPersonDetailsCardProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.card}>
      <CustomText
        fontSize={theme.fontSize.md}
        fontFamily={theme.fonts.SEMI_BOLD}
        color={theme.colors.text}
        marginBottom={theme.SH(12)}
      >
        Service For (Other Person)
      </CustomText>
      <View style={styles.detailRow}>
        <VectoreIcons
          name="person-outline"
          icon="Ionicons"
          size={theme.SF(18)}
          color={theme.colors.lightText}
        />
        <CustomText
          fontSize={theme.fontSize.sm}
          fontFamily={theme.fonts.REGULAR}
          color={theme.colors.text}
          style={styles.detailText}
        >
          {name}
        </CustomText>
      </View>
      <View style={styles.detailRow}>
        <VectoreIcons
          name="mail-outline"
          icon="Ionicons"
          size={theme.SF(18)}
          color={theme.colors.lightText}
        />
        <CustomText
          fontSize={theme.fontSize.sm}
          fontFamily={theme.fonts.REGULAR}
          color={theme.colors.text}
          style={styles.detailText}
        >
          {email}
        </CustomText>
      </View>
      <Pressable
        style={styles.detailRow}
        onPress={() => onCall(contact)}
      >
        <VectoreIcons
          name="call-outline"
          icon="Ionicons"
          size={theme.SF(18)}
          color={theme.colors.lightText}
        />
        <CustomText
          fontSize={theme.fontSize.sm}
          fontFamily={theme.fonts.REGULAR}
          color={theme.colors.primary}
          style={styles.detailText}
        >
          {contact}
        </CustomText>
      </Pressable>
    </View>
  );
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.borderRadius.lg,
      padding: theme.SW(16),
      marginBottom: theme.SH(16),
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
      marginBottom: theme.SH(12),
    },
    detailText: {
      marginLeft: theme.SW(12),
      flex: 1,
    },
    titleContainer: {
      marginBottom: theme.SH(12),
    },
  });
