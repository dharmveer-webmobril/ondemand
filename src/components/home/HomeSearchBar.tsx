import { View, StyleSheet, Pressable, Image, TextInput } from 'react-native';
import  { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeType, useThemeContext } from '@utils/theme';
import { VectoreIcons } from '@components/common';
import imagePaths from '@assets';

type HomeSearchBarProps = {
  onSearch?: (text: string) => void;
  onFilterPress?: () => void;
  placeholder?: string;
};

export default function HomeSearchBar({
  onSearch,
  onFilterPress,
  placeholder,
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
        <VectoreIcons
          name="search"
          size={theme.SF(20)}
          icon="Ionicons"
          color={theme.colors.text}
        />
        <TextInput
          placeholder={placeholder || t('home.search')}
          value={searchText}
          onChangeText={handleSearchChange}
          style={styles.searchInput}
        />
      </View>
      <Pressable style={styles.filterButton} onPress={onFilterPress}>
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
      gap: SW(12),
      marginTop: -SH(30),
    },
    searchContainer: {
      flex: 1,
      backgroundColor: '#fff',
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: theme.SF(10),
      borderRadius: theme.SF(10),
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    searchInput: {
      paddingVertical: theme.SF(12),
      paddingHorizontal: theme.SF(5),
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
