import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts, SF, SH, SW, useIsPortrait } from '../../utils';
import imagePaths from '../../assets/images';
import RouteName from '../../navigation/RouteName';
import { AppText, VectoreIcons } from '..';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { useNavigation } from '@react-navigation/native';

const Header = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const isPortrait = useIsPortrait();
  const getHeaderHeight = () => {
    const statusBarHeight = getStatusBarHeight();
    if (Platform.OS === 'android') {
      return isPortrait ? statusBarHeight - 6 : statusBarHeight + 20;
    } else {
      return isPortrait ? insets.top : insets.top + 20;
    }
  };
  const paddingTop = useMemo(() => {
    let h = getHeaderHeight()
    return h
  }, [isPortrait, insets.top]);



  return (
    <LinearGradient
      colors={['#1A434E', '#378DA5']}
      style={styles.gradient}
    >
      <View style={[styles.container,  { paddingTop: paddingTop }]}>
        <View style={styles.leftView}>
          <VectoreIcons
            name="location-sharp"
            size={SF(24)}
            icon="Ionicons"
            color={Colors.white}
          />
          <View style={styles.locationContainer}>
            <AppText style={styles.currentLocationText}>Current Location</AppText>
            <View style={styles.locationRow}>
              <AppText numberOfLines={1} style={styles.cityText}>
                New York City
              </AppText>
              <Image source={imagePaths.down} style={styles.downIcon} />
            </View>
          </View>
        </View>

        <View style={styles.rightView}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate(RouteName.BOOK_APPOINT, { bookingType: 'immediate' })}
          >
            <Image source={imagePaths.calender_icon} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate(RouteName.NOTIFICATION)}
          >
            <Image source={imagePaths.notification_icon} style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    borderBottomLeftRadius: SF(24),
    borderBottomRightRadius: SF(24),
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
  },
  leftView: {
    width: '60%',
    paddingHorizontal: SW(30),
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightView: {
    width: '40%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationContainer: {
    marginLeft: SW(10),
  },
  currentLocationText: {
    fontSize: SF(12),
    color: Colors.textWhite,
    fontFamily: Fonts.SEMI_BOLD,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cityText: {
    fontSize: SF(14),
    color: Colors.textWhite,
    fontFamily: Fonts.BOLD,
  },
  downIcon: {
    height: SH(12),
    width: SH(12),
    marginLeft: SW(7),
    resizeMode: 'contain',
  },
  iconButton: {
    paddingHorizontal: SW(5),
  },
  icon: {
    height: SF(27),
    width: SF(27),
    resizeMode: 'contain',
  },
});

export default React.memo(Header);


// import React from 'react';
// import { View, Text, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
// import LinearGradient from 'react-native-linear-gradient';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { Colors, Fonts, SF, SH, SW, useIsPortrait } from '../../utils';
// import imagePaths from '../../assets/images';
// import RouteName from '../../navigation/RouteName';
// import { VectoreIcons } from '..';
// import { getStatusBarHeight } from 'react-native-status-bar-height';
// import { useNavigation } from '@react-navigation/native';
// const Header = () => {
//   const insets = useSafeAreaInsets();
//   console.log('getStatusBarHeight()', getStatusBarHeight());
//   const navigation = useNavigation<any>();
//   const isPortrait = useIsPortrait();
//   const headerHeight = ()=>{
//     let height = 0;
//     if( Platform.OS == 'android'){
//       if(!isPortrait){
//         height = 20+getStatusBarHeight()
//       }else{
//         height =getStatusBarHeight()
//       }
//     }else{
//       if(!isPortrait){
//         height =insets.top+20;
//       }else{
//         height =insets.top;
//       }
//     }
//     return height
//   }
//   return (
//     <LinearGradient
//       colors={['#1A434E', '#378DA5']} // customize gradient colors
//       style={[styles.gradient]}
//     >
//       <View style={[styles.container, { paddingTop: Platform.OS == 'android' ? getStatusBarHeight() : insets.top }]}>
//         <View style={styles.leftView}>
//           <VectoreIcons
//             name="location-sharp"
//             size={SF(24)}
//             icon="Ionicons"
//             color={Colors.white}
//           />
//           <View style={styles.locationContainer}>
//             <Text style={styles.currentLocationText}>Current Location</Text>
//             <View style={styles.locationRow}>
//               <Text numberOfLines={1} style={styles.cityText}>
//                 New York City
//               </Text>
//               <Image source={imagePaths.down} style={styles.downIcon} />
//             </View>
//           </View>
//         </View>
//         <View style={styles.rightView}>
//           {/* <TouchableOpacity style={styles.iconButton}>
//           <Image source={imagePaths.calender_icon} style={styles.icon} />
//         </TouchableOpacity> */}
//           <TouchableOpacity style={styles.iconButton}>
//             <Image source={imagePaths.heart_icon} style={styles.icon} />
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.iconButton} onPress={() => {
//             navigation.navigate(RouteName.NOTIFICATION)
//           }}>
//             <Image source={imagePaths.notification_icon} style={styles.icon} />
//           </TouchableOpacity>
//         </View>
//       </View>
//     </LinearGradient>
//   );
// };

// const styles = StyleSheet.create({
//   gradient: {
//     borderBottomLeftRadius: SF(24),
//     borderBottomRightRadius: SF(24),
//   },
//   container: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingBottom: 16,
//   },
//   bottomBordeRa: { borderBottomLeftRadius: SW(30), borderBottomRightRadius: SW(30), },

//   leftView: {
//     width: '60%',
//     paddingHorizontal: SW(30),
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   rightView: {
//     width: '40%',
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   locationContainer: {
//     marginLeft: SW(10),
//   },
//   currentLocationText: {
//     fontSize: SF(12),
//     color: Colors.textWhite,
//     fontFamily: Fonts.SEMI_BOLD,
//   },
//   locationRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   cityText: {
//     fontSize: SF(14),
//     color: Colors.textWhite,
//     fontFamily: Fonts.BOLD,
//   },
//   downIcon: {
//     height: SH(12),
//     width: SH(12),
//     marginLeft: SW(7),
//     resizeMode: 'contain',
//   },
//   iconButton: {
//     paddingHorizontal: SW(5),
//   },
//   icon: {
//     height: SF(27),
//     width: SF(27),
//     resizeMode: 'contain',
//   },
// });

// export default Header;
