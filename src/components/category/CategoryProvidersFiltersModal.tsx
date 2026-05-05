import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'react-native-element-dropdown';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomButton, CustomText, VectoreIcons } from '@components/common';
import { Category } from '@services/api/queries/appQueries';

const SCREEN_W = Dimensions.get('window').width;

export type CategoryProvidersFiltersModalProps = {
  visible: boolean;
  onClose: () => void;
  categories: Category[];
  /** `all` or category `_id` */
  categoryValue: string;
  minRatingValue: string;
  maxDistanceValue: string;
  sortByValue: string;
  onCategoryChange: (categoryId: string) => void;
  onMinRatingChange: (value: string) => void;
  onMaxDistanceChange: (value: string) => void;
  onSortByChange: (value: string) => void;
  onApply: () => void;
  onResetAll: () => void;
};

export default function CategoryProvidersFiltersModal({
  visible,
  onClose,
  categories,
  categoryValue,
  minRatingValue,
  maxDistanceValue,
  sortByValue,
  onCategoryChange,
  onMinRatingChange,
  onMaxDistanceChange,
  onSortByChange,
  onApply,
  onResetAll,
}: CategoryProvidersFiltersModalProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const slideX = useRef(new Animated.Value(SCREEN_W)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideX, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }).start();
    } else {
      slideX.setValue(SCREEN_W);
    }
  }, [visible, slideX]);

  const categoryItems = useMemo(() => {
    const rows = [{ label: t('category.all'), value: 'all' }];
    for (const c of categories) {
      if (c?._id && c?.name) {
        rows.push({ label: c.name, value: c._id });
      }
    }
    return rows;
  }, [categories, t]);

  const minRatingItems = useMemo(
    () => [
      { label: t('category.filterRatingAny'), value: '' },
      { label: t('category.filterRating4'), value: '4' },
      { label: t('category.filterRating3'), value: '3' },
      { label: t('category.filterRating2'), value: '2' },
      { label: t('category.filterRating1'), value: '1' },
    ],
    [t],
  );

  const sortItems = useMemo(
    () => [
      { label: t('category.sortHighestRated'), value: 'rating' },
      { label: t('category.sortNearest'), value: 'distance' },
      { label: t('category.sortName'), value: 'name' },
      { label: t('category.sortRecommended'), value: 'recommended' },
    ],
    [t],
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <Animated.View
          style={[
            styles.panel,
            {
              paddingTop: theme.SH(15),
              paddingBottom: insets.bottom + theme.SH(12),
              transform: [{ translateX: slideX }],
            },
          ]}
        >
          <View style={styles.panelHeader}>
            <CustomText style={styles.panelTitle}>
              {t('category.filtersTitle')}
            </CustomText>
            <Pressable onPress={onClose} hitSlop={12}>
              <VectoreIcons
                name="close"
                icon="Ionicons"
                size={theme.SF(26)}
                color={theme.colors.text}
              />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <CustomText style={styles.fieldLabel}>
              {t('category.title')}
            </CustomText>
            <Dropdown
              style={styles.dropdown}
              containerStyle={styles.dropdownContainer}
              placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownSelected}
              itemTextStyle={styles.dropdownItemText}
              data={categoryItems}
              labelField="label"
              valueField="value"
              value={categoryValue}
              onChange={item => onCategoryChange(item.value)}
            />

            <CustomText style={styles.fieldLabel}>
              {t('category.filterMinRating')}
            </CustomText>
            <Dropdown
              style={styles.dropdown}
              containerStyle={styles.dropdownContainer}
              placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownSelected}
              itemTextStyle={styles.dropdownItemText}
              placeholder={t('category.filterRatingAny')}
              data={minRatingItems}
              labelField="label"
              valueField="value"
              value={minRatingValue === '' ? undefined : String(minRatingValue)}
              onChange={item => onMinRatingChange(item.value)}
            />

            <CustomText style={styles.fieldLabel}>
              {t('category.filterSortBy')}
            </CustomText>
            <Dropdown
              style={styles.dropdown}
              containerStyle={styles.dropdownContainer}
              placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownSelected}
              itemTextStyle={styles.dropdownItemText}
              data={sortItems}
              labelField="label"
              valueField="value"
              value={sortByValue}
              onChange={item => onSortByChange(item.value)}
            />

            <CustomText style={styles.fieldLabel}>
              {t('category.filterMaxDistance')}
            </CustomText>
            <TextInput
              style={styles.distanceInput}
              value={maxDistanceValue}
              onChangeText={onMaxDistanceChange}
              placeholder={t('category.filterMaxDistancePh')}
              placeholderTextColor={theme.colors.lightText || '#999'}
              keyboardType="decimal-pad"
              maxLength={8}
            />
            <CustomText style={styles.hint}>
              {t('category.filterDistanceHint')}
            </CustomText>
          </ScrollView>

          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [
                styles.resetButton,
                pressed && styles.resetPressed,
              ]}
              onPress={onResetAll}
            >
              <VectoreIcons
                name="close-circle-outline"
                icon="Ionicons"
                size={theme.SF(20)}
                color={theme.colors.primary || '#135D96'}
              />
              <CustomText style={styles.resetLabel}>
                {t('category.resetAllFilters')}
              </CustomText>
            </Pressable>
            <CustomButton
              title={t('category.applyFilters')}
              onPress={onApply}
              backgroundColor={theme.colors.primary}
              textColor={theme.colors.whitetext}
              paddingHorizontal={theme.SW(24)}
            />
          </View>
        </Animated.View>
      </SafeAreaView>
    </Modal>
  );
}

const createStyles = (theme: ThemeType) => {
  const { colors: Colors, SF, fonts: Fonts, SW, SH } = theme;
  const panelW = Math.min(SCREEN_W * 0.92, SW(360));
  return StyleSheet.create({
    root: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.45)',
    },
    panel: {
      width: panelW,
      maxWidth: '100%',
      flex: 1,
      backgroundColor: Colors.white,
      shadowColor: '#000',
      shadowOffset: { width: -2, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 16,
    },
    panelHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: SW(16),
      paddingBottom: SH(12),
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: Colors.border || '#E5E5E5',
    },
    panelTitle: {
      fontSize: SF(18),
      fontFamily: Fonts.BOLD,
      color: Colors.text,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: SW(16),
      paddingTop: SH(16),
      paddingBottom: SH(24),
    },
    fieldLabel: {
      fontSize: SF(13),
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.text,
      marginBottom: SH(6),
    },
    dropdown: {
      height: SH(48),
      borderWidth: 1,
      borderColor: Colors.border || '#DDD',
      borderRadius: SF(10),
      paddingHorizontal: SW(12),
      marginBottom: SH(16),
    },
    dropdownContainer: {
      borderRadius: SF(10),
    },
    dropdownPlaceholder: {
      fontSize: SF(14),
      color: Colors.lightText || '#999',
    },
    dropdownSelected: {
      fontSize: SF(14),
      fontFamily: Fonts.MEDIUM,
      color: Colors.text,
    },
    dropdownItemText: {
      fontSize: SF(14),
      color: Colors.text,
    },
    distanceInput: {
      height: SH(48),
      borderWidth: 1,
      borderColor: Colors.border || '#DDD',
      borderRadius: SF(10),
      paddingHorizontal: SW(12),
      fontSize: SF(14),
      fontFamily: Fonts.REGULAR,
      color: Colors.text,
      marginBottom: SH(6),
    },
    hint: {
      fontSize: SF(11),
      fontFamily: Fonts.REGULAR,
      color: Colors.lightText || '#888',
      marginBottom: SH(8),
    },
    actions: {
      paddingHorizontal: SW(16),
      paddingTop: SH(12),
      gap: SH(12),
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: Colors.border || '#E5E5E5',
    },
    resetButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SW(8),
      paddingVertical: SH(12),
      borderRadius: SF(10),
      borderWidth: 1,
      borderColor: Colors.primary || '#135D96',
    },
    resetPressed: {
      opacity: 0.85,
    },
    resetLabel: {
      fontSize: SF(15),
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.primary || '#135D96',
    },
  });
};
