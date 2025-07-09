import {
  View,
  StyleSheet,
  Image,
  Platform,
  Pressable,
} from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Fonts, navigate, SF, SH, SW } from '../../utils';
import VectorIcon from '../VectoreIcons';
import imagePaths from '../../assets/images';
import InputField from '../TextInputCustom';
import RouteName from '../../navigation/RouteName';

interface HomeSearchBarProps {
  onTextchange?: (text: string) => void;
  showFilterIcon?: boolean;
  bgColor?: string;
  pageName?: string
}

const HomeSearchBar: React.FC<HomeSearchBarProps> = ({
  showFilterIcon = false, // Default to true
  bgColor = Colors.lightGray,
}) => {
  return (
    <View style={styles.searchContainer}>
      <View style={{ width: showFilterIcon ? '86%' : '100%' }}>
        <InputField
          placeholder={'Search'}
          inputContainer={{ backgroundColor: Colors.searchBarBG,borderWidth:0 ,height:SF(40)}}
          containerStyle={styles.inputContainer}
          inputStyle={styles.inputStyle}
          placeholderTextColor={Colors.searchBarPlac}
          leftIcon={imagePaths.Search}
          color={Colors.searchBarPlac}
        />
      
      </View>

      {/* Render filter icon only if showFilterIcon is true */}
      {showFilterIcon &&
      <Pressable onPress={()=>{navigate(RouteName.FILTER_SCREEN)}}>

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
  inputContainer: {
    padding: 0,
  },
  inputStyle: {
    color: Colors.searchBarPlac,
    fontFamily: Fonts.MEDIUM,
    marginLeft: Platform.OS == 'ios' ? 3 : 0,
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
