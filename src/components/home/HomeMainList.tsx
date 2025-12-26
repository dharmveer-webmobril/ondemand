import { View, SectionList, StyleSheet, RefreshControl } from 'react-native';
import React, { useMemo } from 'react';
import HomeSlider from './HomeSlider';
import HomeCategoryList from './HomeCategoryList';
import HomeProvider from './HomeProvider';
import { CustomText } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';

type SectionData = {
  title: string;
  data: any[];
  key: string;
  renderItem: () => React.ReactElement;
};

type HomeMainListProps = {
  refreshing?: boolean;
  onRefresh?: () => void;
};

const DATA: SectionData[] = [
  {
    title: '',
    data: [{}],
    key: 'slider',
    renderItem: () => <HomeSlider />,
  },
  {
    title: 'Categories',
    renderItem: () => <HomeCategoryList />,
    key: 'Categories',
    data: [{}],
  },
  {
    title: 'Nearest Provider',
    key: 'provider',
    data: [{}],
    renderItem: () => <HomeProvider />,
  },
];

export default function HomeMainList({ refreshing = false, onRefresh }: HomeMainListProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleViewAll = (sectionKey: string) => {
    // TODO: Navigate to respective screen when ready
    console.log('View All pressed for:', sectionKey);
  };

  return (
    <SectionList
      sections={DATA}
      keyExtractor={(_, index) => index?.toString()}
      renderItem={({ item, section }: any) => section.renderItem()}
      renderSectionHeader={({ section: { title, key } }) =>
        title ? (
          <View style={[styles.headerContainer, styles.sectionHeader]}>
            <CustomText
              color={theme.colors.text}
              fontSize={theme.fontSize.sm}
              fontFamily={theme.fonts.SEMI_BOLD}
            >
              {title}
            </CustomText>
            <CustomText
              color={theme.colors.primary || '#135D96'}
              style={styles.viewAllText}
              fontSize={theme.fontSize.sm}
              fontFamily={theme.fonts.SEMI_BOLD}
              onPress={() => handleViewAll(key)}
            >
              View All
            </CustomText>
          </View>
        ) : null
      }
      SectionSeparatorComponent={() => <View style={styles.sectionSeparator} />}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
          colors={[theme.colors.primary || '#135D96']}
        />
      }
      showsVerticalScrollIndicator={false}
      stickySectionHeadersEnabled={false}
    />
  );
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    sectionHeader: {
      marginTop: theme.SH(25),
      paddingHorizontal: theme.SW(16),
    },
    viewAllText: {
      textDecorationLine: 'underline',
    },
    sectionSeparator: {
      height: theme.SH(30),
    },
  });