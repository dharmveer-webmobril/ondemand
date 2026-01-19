import { View, FlatList, Pressable, StyleSheet } from 'react-native';
import React, { useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomText } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';
import { Category } from '@services/api/queries/appQueries';

type CategoryTabsProps = {
  categories: Category[];
  selectedCategoryId: string | null | 'all';
  onSelectCategory: (category: Category | null) => void;
};

export default function CategoryTabs({ 
  categories, 
  selectedCategoryId, 
  onSelectCategory 
}: CategoryTabsProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  const flatListRef = useRef<FlatList>(null);

  const allCategories = useMemo(() => {
    return [{ _id: 'all', name: t('category.all'), status: true }, ...categories];
  }, [categories, t]);

  // Scroll to selected category when it changes or when categories are loaded
  useEffect(() => {
    if (selectedCategoryId && flatListRef.current && allCategories.length > 0) {
      const index = allCategories.findIndex(cat => 
        cat._id === selectedCategoryId || 
        (selectedCategoryId === 'all' && cat._id === 'all')
      );
      
      if (index >= 0) {
        // Use setTimeout to ensure FlatList is rendered and laid out
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            index,
            animated: true,
            viewPosition: 0, // Scroll to show at the start (left side)
          });
        }, 200);
      }
    }
  }, [selectedCategoryId, allCategories.length]);

  const renderTab = ({ item }: { item: Category | { _id: string; name: string; status: boolean } }) => {
    // Show "All" as selected if selectedCategoryId is 'all' or null
    const isSelected = selectedCategoryId === item._id || (item._id === 'all' && (selectedCategoryId === 'all' || selectedCategoryId === null));
    
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
        ref={flatListRef}
        data={allCategories}
        renderItem={renderTab}
        keyExtractor={(item) => item._id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
        onScrollToIndexFailed={(info) => {
          // Handle scroll to index failure gracefully
          const wait = new Promise(resolve => setTimeout(resolve, 500));
          wait.then(() => {
            flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
          });
        }}
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

