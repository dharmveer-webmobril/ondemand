import { View, StyleSheet, Pressable, Image } from 'react-native';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomInput } from '@components/common';
import imagePaths from '@assets';

type HomeSearchBarProps = {
  onSearch?: (text: string) => void;
  onFilterPress?: () => void;
  placeholder?: string;
};

export default function HomeSearchBar({ 
  onSearch, 
  onFilterPress,
  placeholder
}: HomeSearchBarProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState('');

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    if (onSearch) {
      onSearch(text);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <CustomInput
          placeholder={placeholder || t('home.search')}
          value={searchText}
          onChangeText={handleSearchChange}
          leftIcon={imagePaths.Search}
          withBackground="white"
          inputTheme=""
          transparentBackground={false}
        />
      </View>
      <Pressable 
        style={styles.filterButton}
        onPress={onFilterPress}
      >
        <Image 
          source={imagePaths.filter_icon} 
          style={styles.filterIcon}
          resizeMode="contain"
        />
      </Pressable>
    </View>
  );
}

const createStyles = (theme: ThemeType) => {
  const { colors: Colors, SF, SW, SH } = theme;
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: SW(20),
      paddingTop: SH(12),
      backgroundColor: Colors.white,
      gap: SW(12),
    },
    searchContainer: {
      flex: 1,
    },
    filterButton: {
      width: SF(48),
      height: SF(48),
      backgroundColor: Colors.primary || '#135D96',
      borderRadius: SF(12),
      justifyContent: 'center',
      alignItems: 'center',
    },
    filterIcon: {
      width: SF(20),
      height: SF(20),
      tintColor: Colors.white,
    },
  });
};

