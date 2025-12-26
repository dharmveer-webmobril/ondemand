import { View, StyleSheet, Pressable, Image } from 'react-native'
import React, { useMemo } from 'react'
import { ThemeType, useThemeContext } from '@utils/theme';
import StarRating from 'react-native-star-rating-widget';
import { CustomText, ImageLoader, Spacing } from '@components/common';
import imagePaths from '@assets';
export default function HomeProviderItem() {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), []);

  return <Pressable
    onPress={() => {

    }}
    style={styles.container}
  >
    <View style={styles.header}>
      <ImageLoader source={imagePaths.recomanded1} mainImageStyle={styles.logo} resizeMode="cover" />
      <CustomText style={styles.text}>{'name'}</CustomText>
      <Image source={imagePaths.verified_star} style={styles.verifiedIcon} resizeMode="contain" />
    </View>
    <Spacing space={10} />
    <View style={styles.ratingContainer}>
      <StarRating
        starStyle={styles.starStyle}
        starSize={theme.SF(12)}
        rating={4.5}
        onChange={() => { }}
        color="#FAAC00"
      />
      <CustomText style={styles.ratingtxt}>({4.5})</CustomText>
    </View>
    <Spacing space={7} />
    <View style={styles.locationContainer}>
      <Image source={imagePaths.service_loc} style={styles.locationIcon} />
      <CustomText style={styles.addtext} numberOfLines={1}>
        Lorem Ipsum is simply dummy text of the
      </CustomText>
      <CustomText style={styles.dotText}> . </CustomText>
      <CustomText style={styles.closetext}>Closed</CustomText>
    </View>
  </Pressable>
}
const createStyles = (theme: ThemeType) => {
  const { colors: Colors, SF, fonts: Fonts, SW, SH } = theme;
  return StyleSheet.create({
    backgroundContainer: {
      backgroundColor: '#EEF6F9',
      marginTop: SF(17),
      marginBottom: SF(30),
    },
    container: {
      width: SW(190),
      marginRight: 30,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    logo: {
      width: SF(28),
      height: SF(28),
      borderRadius: SF(14),
      marginLeft:-2
    },
    verifiedIcon: {
      width: SF(14),
      height: SF(14),
      marginLeft: SF(8),
    },
    text: {
      color: Colors.textAppColor,
      fontFamily: Fonts.MEDIUM,
      fontSize: SF(12),
      marginLeft: SF(10),
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      width: SF(90),
    },
    ratingtxt: {
      color: Colors.textAppColor,
      fontFamily: Fonts.REGULAR,
      marginLeft: 5,
      fontSize: SF(12),
    },
    locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      width: SW(120),
    },
    locationIconskelton: {
      height: SF(15),
      width: SF(160),
      resizeMode: 'contain',
      tintColor: Colors.textAppColor,
    },
    locationIcon: {
      height: SF(15),
      width: SF(15),
      resizeMode: 'contain',
      tintColor: Colors.textAppColor,
    },
    addtext: {
      color: Colors.textAppColor,
      fontFamily: Fonts.MEDIUM,
      marginLeft: 5,
      fontSize: SF(12),
    },
    closetext: {
      color: '#777777',
      fontFamily: Fonts.MEDIUM,
      marginLeft: 5,
      fontSize: SF(12),
    },
    dotText: {
      fontFamily: Fonts.EXTRA_BOLD,
      fontSize: SF(18),
      marginTop: -4,
      marginLeft: 2,
    },
    flatListContainer: {
      backgroundColor: '#EEF6F9',
      paddingVertical: SH(20),
    },
    skeletonContainer: {
      width: SW(200),
      marginRight: 30,
      alignItems: 'center',
    },
    skeletonImage: {
      height: SF(56),
      width: SF(56),
      borderRadius: SF(28),
      backgroundColor: '#E0E0E0',
    },
    skeletonText: {
      height: SF(14),
      width: SW(80),
      marginTop: 5,
      backgroundColor: '#E0E0E0',
      borderRadius: 4,
    },
    messageContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      paddingVertical: SH(20),
    },
    messageText: {
      color: Colors.textAppColor,
      fontFamily: Fonts.MEDIUM,
      fontSize: SF(14),
      textAlign: 'center',
    },
    retryButton: {
      padding: SW(10),
      backgroundColor: Colors.primary,
      borderRadius: SF(8),
      marginTop: SH(10),
      width: '50%',
      height: SH(40),
      paddingHorizontal: 5
    },
    retrybuttontext: {
      fontFamily: Fonts.MEDIUM,
      fontSize: SF(14),
      color: Colors.textWhite,
      textAlign: 'center'
    },
    viewalltext: {
      fontFamily: Fonts.MEDIUM,
      fontSize: SF(14),
      color: Colors.textWhite,
    },
    starStyle: {
      marginHorizontal: 2,
    },
    fullWidth: {
      width: '100%',
    },
    // New skeleton styles
    textSkeleton: {
      height: SF(12),
      width: SW(120),
      marginLeft: SF(10),
      backgroundColor: '#E0E0E0',
      borderRadius: 4,
    },
    ratingSkeleton: {
      height: SF(12),
      width: SF(80),
      backgroundColor: '#E0E0E0',
      borderRadius: 4,
    },
    ratingtxtSkeleton: {
      height: SF(12),
      width: SF(30),
      marginLeft: 5,
      backgroundColor: '#E0E0E0',
      borderRadius: 4,
    },
    locationIconSkeleton: {
      height: SF(15),
      width: SF(15),
      backgroundColor: '#E0E0E0',
      borderRadius: SF(15) / 2,
    },
    addtextSkeleton: {
      height: SF(12),
      width: SW(80),
      marginLeft: 5,
      backgroundColor: '#E0E0E0',
      borderRadius: 4,
    },
    dotTextSkeleton: {
      height: SF(18),
      width: SF(18),
      marginLeft: 2,
      backgroundColor: '#E0E0E0',
      borderRadius: SF(18) / 2,
    },
    closetextSkeleton: {
      height: SF(12),
      width: SF(40),
      marginLeft: 5,
      backgroundColor: '#E0E0E0',
      borderRadius: 4,
    },

  })
}