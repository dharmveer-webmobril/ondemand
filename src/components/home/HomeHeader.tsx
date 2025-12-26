import { View,  StyleSheet, Image, TouchableOpacity } from 'react-native'
import React, { useMemo } from 'react'
import { ThemeType, useThemeContext } from '@utils/theme';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CustomText, VectoreIcons } from '@components/common';
import imagePaths from '@assets';

export default function HomeHeader() {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), []);
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient
      colors={['#011321', '#066AB7', '#009BFF']}
      style={[
        styles.headerContainer,
        { paddingTop: insets.top }
      ]}
    >
      <View style={styles.container}>
        <View style={styles.leftContainer}>
          <VectoreIcons
            name="location-sharp"
            size={24}
            icon="Ionicons"
            color={'white'}
          />
          <View style={styles.locationContainer}>
            <CustomText style={styles.currentLocationText}>Current Location</CustomText>
            <View style={styles.locationRow}>
              <CustomText numberOfLines={1} style={styles.cityText}>
                New York City
              </CustomText>
              <Image source={imagePaths.down} style={styles.downIcon} />
            </View>
          </View>
        </View>
        <View style={styles.rightView}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => { }}
          >
            <Image source={imagePaths.calender_icon} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => { }}
          >
            <Image source={imagePaths.notification_icon} style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  )
}

const createStyles = (theme: ThemeType) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    marginTop: 15
  },
  headerContainer: {
    width: "100%",
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  locationContainer: {
    marginLeft: 5
  },
  locationTitle: {
    color: theme.colors.whitetext,
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fonts.MEDIUM
  },
  locationValue: {
    marginTop: 2,
    color: theme.colors.whitetext,
    fontSize: theme.fontSize.md,
    fontFamily: theme.fonts.SEMI_BOLD
  },
  leftContainer: { flexDirection: 'row', alignItems: 'center' },
  currentLocationText: {
    fontSize: theme.SF(12),
    color: theme.colors.whitetext,
    fontFamily: theme.fonts.SEMI_BOLD,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cityText: {
    fontSize: theme.SF(14),
    color: theme.colors.textWhite,
    fontFamily: theme.fonts.BOLD,
  },
  downIcon: {
    height: theme.SH(12),
    width: theme.SH(12),
    marginLeft: theme.SW(7),
    resizeMode: 'contain',
  },
  rightView: {
    width: '40%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  iconButton: {
    paddingHorizontal: theme.SW(5),
  },
  icon: {
    height: theme.SF(27),
    width: theme.SF(27),
    resizeMode: 'contain',
  },
})