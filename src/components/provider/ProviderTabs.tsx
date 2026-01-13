import { View, StyleSheet, Pressable } from 'react-native';
import React, { useMemo } from 'react';
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText } from '@components/common';

type TabType = 'services' | 'reviews' | 'portfolio' | 'details';

type ProviderTabsProps = {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
};

const tabs: { id: TabType; label: string }[] = [
  { id: 'services', label: 'Services' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'details', label: 'Details' },
];

export default function ProviderTabs({ activeTab, onTabChange }: ProviderTabsProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onTabChange(tab.id)}
            style={({ pressed }) => [
              styles.tab,
              isActive && styles.activeTab,
              pressed && { opacity: 0.7 },
            ]}
          >
            <CustomText
              style={[styles.tabText, isActive && styles.activeTabText]}
            >
              {tab.label}
            </CustomText>
            {isActive && <View style={styles.indicator} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const createStyles = (theme: ThemeType) => {
  const { colors: Colors, SF, fonts: Fonts, SW } = theme;
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: Colors.white,
      borderBottomWidth: 1,
      borderBottomColor: Colors.gray || '#E0E0E0',
    },
    tab: {
      flex: 1,
      paddingVertical: SF(14),
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    activeTab: {
      backgroundColor: Colors.white,
    },
    tabText: {
      fontSize: SF(14),
      fontFamily: Fonts.MEDIUM,
      color: Colors.textAppColor || Colors.text,
    },
    activeTabText: {
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.primary,
    },
    indicator: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: SF(3),
      backgroundColor: Colors.primary,
    },
  });
};

