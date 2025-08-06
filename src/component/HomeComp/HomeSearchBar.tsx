import {
  View,
  StyleSheet,
  Image,
  Platform,
  Pressable,
} from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Fonts, navigate, SF } from '../../utils';
import imagePaths from '../../assets/images';
import InputField from '../TextInputCustom';
import RouteName from '../../navigation/RouteName';
import { useTranslation } from 'react-i18next';

interface HomeSearchBarProps {
  onTextchange?: (text: string) => void;
  showFilterIcon?: boolean;
  bgColor?: string;
  pageName?: string;
  value?: any
}

const HomeSearchBar: React.FC<HomeSearchBarProps> = ({
  showFilterIcon = false, // Default to true
  onTextchange,
  value
}) => {
  const { t } = useTranslation();
  return (
    <View style={styles.searchContainer}>
      <View style={[styles.inputWrapper, showFilterIcon ? styles.inputWrapperWithFilter : styles.inputWrapperFull]}>
        <InputField
          placeholder={t('placeholders.search')}
          inputContainer={{ backgroundColor: Colors.searchBarBG, borderWidth: 0, height: SF(44) }}
          containerStyle={styles.inputContainer}
          inputStyle={styles.inputStyle}
          placeholderTextColor={Colors.searchBarPlac}
          leftIcon={imagePaths.Search}
          color={Colors.searchBarPlac}
          onChangeText={onTextchange}
          value={value}
        />

      </View>

      {/* Render filter icon only if showFilterIcon is true */}
      {showFilterIcon &&
        <Pressable onPress={() => { navigate(RouteName.FILTER_SCREEN) }}>

          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.filterButton}
            colors={[Colors.themeDarkColor, Colors.themeColor]}
          >
            <Image
              source={imagePaths.filter_icon}
              style={styles.filterIcon}
            />
          </LinearGradient>
        </Pressable>
      }

    </View>
  );
};

export default HomeSearchBar;

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputWrapper: {
    width: '86%',
  },
  inputWrapperWithFilter: {
    width: '86%',
  },
  inputWrapperFull: {
    width: '100%',
  },
  inputContainer: {
    padding: 0,
  },
  inputStyle: {
    color: Colors.searchBarPlac,
    fontFamily: Fonts.MEDIUM,
    marginLeft: Platform.OS === 'ios' ? 3 : 0,
    fontSize: SF(16),
  },

  filterButton: {
    borderRadius: SF(6.6),
    justifyContent: 'center',
    alignItems: 'center',
    height: SF(30),
    width: SF(30),
  },
  filterIcon: {
    height: SF(18),
    width: SF(18),
    resizeMode: 'contain',
  },
});
