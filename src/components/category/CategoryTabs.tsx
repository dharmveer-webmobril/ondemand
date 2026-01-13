import { View, FlatList, Pressable, StyleSheet } from 'react-native';
import React, { useMemo } from 'react';
import { CustomText } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';
import { Category } from '@services/api/queries/appQueries';

type CategoryTabsProps = {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (category: Category | null) => void;
};

export default function CategoryTabs({ 
  categories, 
  selectedCategoryId, 
  onSelectCategory 
}: CategoryTabsProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const allCategories = useMemo(() => {
    return [{ _id: 'all', name: 'All', status: true }, ...categories];
  }, [categories]);

  const renderTab = ({ item }: { item: Category | { _id: string; name: string; status: boolean } }) => {
    const isSelected = selectedCategoryId === item._id;
    
    return (
      <Pressable
        onPress={() => onSelectCategory(item._id === 'all' ? null : item as Category)}
        style={({ pressed }) => [
          styles.tab,
          isSelected && styles.selectedTab,
          pressed && { opacity: 0.7 },
        ]}
      >
        <CustomText
          style={[
            styles.tabText,
            isSelected && styles.selectedTabText,
          ]}
        >
          {item.name}
        </CustomText>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={allCategories}
        renderItem={renderTab}
        keyExtractor={(item) => item._id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
      />
    </View>
  );
}

const createStyles = (theme: ThemeType) => {
  const { colors: Colors, SF, fonts: Fonts, SW } = theme;
  return StyleSheet.create({
    container: {
      backgroundColor: Colors.white,
      paddingVertical: SF(12),
    },
    tabsContainer: {
      paddingHorizontal: SW(20),
      gap: SW(10),
    },
    tab: {
      paddingHorizontal: SW(16),
      paddingVertical: SF(8),
      borderRadius: SF(20),
      backgroundColor: Colors.background || '#F5F5F5',
      marginRight: SW(8),
    },
    selectedTab: {
      backgroundColor: Colors.primary,
    },
    tabText: {
      fontSize: SF(14),
      fontFamily: Fonts.MEDIUM,
      color: Colors.text,
    },
    selectedTabText: {
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.whitetext || '#FFFFFF',
    },
  });
};

