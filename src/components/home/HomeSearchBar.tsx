import { View, StyleSheet, TextInput, Pressable } from 'react-native';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeType, useThemeContext } from '@utils/theme';
import { VectoreIcons } from '@components/common';
import {
  HOME_BENTO_RADIUS,
  HOME_SEARCH_SHADOW,
} from './bentoEffects';
import { HOME_HORIZONTAL_PADDING } from './homeLayout';
import GlassSkyButton from './GlassSkyButton';

type HomeSearchBarProps = {
  onSearchPress?: () => void;
  onFilterPress?: () => void;
  placeholder?: string;
};

export default function HomeSearchBar({
  onSearchPress,
  onFilterPress,
  placeholder,
}: HomeSearchBarProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  const rowH = theme.SF(48);

  return (
    <View style={styles.container}>
      <Pressable
        onPress={onSearchPress}
        accessibilityRole="button"
        accessibilityLabel={t('home.search')}
        style={({ pressed }) => [
          styles.searchContainer,
          HOME_SEARCH_SHADOW,
          pressed && styles.searchPressed,
        ]}
      >
        <VectoreIcons
          name="search"
          size={theme.SF(20)}
          icon="Ionicons"
          color={theme.colors.text}
        />
        <TextInput
          placeholder={placeholder || t('home.search')}
          placeholderTextColor={theme.colors.lightText || '#9CA3AF'}
          editable={false}
          pointerEvents="none"
          style={styles.searchInput}
        />
      </Pressable>

      <GlassSkyButton
        onPress={onFilterPress ?? (() => {})}
        size={rowH}
        borderRadius={theme.SF(HOME_BENTO_RADIUS)}
        accessibilityLabel="Filter"
        icon={
          <VectoreIcons
            name="options-outline"
            icon="Ionicons"
            size={theme.SF(22)}
            color="#0C4A6E"
          />
        }
      />
    </View>
  );
}

const createStyles = (theme: ThemeType) => {
  const { SF, SW, fonts } = theme;
  const rowH = SF(48);
  const overlapHalf = rowH / 2;

  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: SW(HOME_HORIZONTAL_PADDING),
      paddingTop: 0,
      marginTop: -overlapHalf,
      gap: SW(12),
    },
    searchContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: rowH,
      backgroundColor: '#FFFFFF',
      borderRadius: SF(HOME_BENTO_RADIUS),
      paddingLeft: SF(14),
      paddingRight: SF(12),
    },
    searchPressed: {
      opacity: 0.92,
    },
    searchInput: {
      flex: 1,
      paddingVertical: SF(12),
      paddingHorizontal: SF(8),
      fontSize: theme.fontSize.md,
      fontFamily: fonts.REGULAR,
      color: theme.colors.text,
    },
  });
};
