import React, { useMemo } from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import { CustomText } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';

type CustomBookingTabsProps = {
  tabs: Array<{ id: number | string; name: string; type: string }>;
  selectedIndex: number;
  onTabPress: (index: number) => void;
};

export default function CustomBookingTabs({
  tabs,
  selectedIndex,
  onTabPress,
}: CustomBookingTabsProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      {tabs.map((tab, index) => {
        const isSelected = selectedIndex === index;
        return (
          <Pressable
            key={tab.id}
            style={[
              styles.tab,
              isSelected ? styles.selectedTab : styles.unselectedTab,
            ]}
            onPress={() => onTabPress(index)}
            android_ripple={{ color: theme.colors.gray || '#F5F5F5' }}
          >
            <CustomText
              fontSize={theme.fontSize.md}
              fontFamily={isSelected ? theme.fonts.SEMI_BOLD : theme.fonts.MEDIUM}
              color={isSelected ? theme.colors.white : theme.colors.text}
            >
              {tab.name}
            </CustomText>
          </Pressable>
        );
      })}
    </View>
  );
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: theme.colors.white,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      padding: theme.SW(4),
      gap: theme.SW(4),
    },
    tab: {
      flex: 1,
      height: theme.SH(40),
      borderRadius: theme.borderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.SW(16),
    },
    selectedTab: {
      backgroundColor: theme.colors.primary,
    },
    unselectedTab: {
      backgroundColor: theme.colors.white,
    },
  });

