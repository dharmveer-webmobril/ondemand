import { View, StyleSheet, Pressable } from 'react-native';
import React, { useMemo } from 'react';
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText, CustomButton, VectoreIcons } from '@components/common';

type ServiceItemProps = {
  id: string;
  name: string;
  price: number;
  duration?: string;
  icon?: string;
  onBook?: () => void;
};

export default function ServiceItem({
  name,
  price,
  duration,
  icon = 'cut',
  onBook,
}: ServiceItemProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && { opacity: 0.8 },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.leftSection}>
          {icon && (
            <View style={styles.iconContainer}>
              <VectoreIcons
                name={icon}
                icon="Ionicons"
                size={theme.SF(20)}
                color={theme.colors.primary}
              />
            </View>
          )}
          <View style={styles.infoContainer}>
            <CustomText style={styles.serviceName}>{name}</CustomText>
            <View style={styles.priceContainer}>
              <CustomText style={styles.price}>${price.toFixed(2)}</CustomText>
              {duration && (
                <CustomText style={styles.duration}>{duration}</CustomText>
              )}
            </View>
          </View>
        </View>
        <CustomButton
          title="Book"
          onPress={onBook}
          buttonStyle={styles.bookButton}
          buttonTextStyle={styles.bookButtonText}
          backgroundColor={theme.colors.primary}
          textColor={theme.colors.whitetext}
          paddingHorizontal={theme.SW(24)}
        />
      </View>
    </Pressable>
  );
}

const createStyles = (theme: ThemeType) => {
  const { colors: Colors, SF, fonts: Fonts, SW, SH } = theme;
  return StyleSheet.create({
    container: {
      backgroundColor: Colors.white,
      borderBottomWidth: 1,
      borderBottomColor: Colors.gray || '#E0E0E0',
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: SW(20),
      paddingVertical: SH(16),
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    iconContainer: {
      width: SF(40),
      height: SF(40),
      borderRadius: SF(20),
      backgroundColor: Colors.secondary || '#E3F2FD',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: SW(12),
    },
    infoContainer: {
      flex: 1,
    },
    serviceName: {
      fontSize: SF(15),
      fontFamily: Fonts.MEDIUM,
      color: Colors.text,
      marginBottom: SH(4),
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SW(8),
    },
    price: {
      fontSize: SF(14),
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.text,
    },
    duration: {
      fontSize: SF(12),
      fontFamily: Fonts.REGULAR,
      color: Colors.textAppColor || Colors.text,
    },
    bookButton: {
      borderRadius: SF(6),
      paddingVertical: SH(6),
    },
    bookButtonText: {
      fontSize: SF(14),
      fontFamily: Fonts.SEMI_BOLD,
    },
  });
};

