import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ImageLoader from './ImageLoader'; // adjust import path as needed
import VectoreIcons from './VectoreIcons'; // adjust import path as needed
import { Colors, Fonts, SF, SH, SW } from '../utils';
import imagePaths from '../assets/images';
import AppText from './AppText';

const UserprofileView = ({ title = 'Juana', imageSource = imagePaths.user, showTick = true }) => {
  return (
    <View style={styles.serviceItem}>
      <View style={styles.imgContainer}>
        <ImageLoader
          source={imageSource}
          resizeMode="cover"
          mainImageStyle={styles.img}
        />
      </View>
      <AppText numberOfLines={2} style={styles.serviceTitle}>
        {title}
      </AppText>
      {showTick && (
        <View style={styles.tickIcon}>
          <VectoreIcons icon="AntDesign" name="checkcircle" color="green" size={SF(18)} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  serviceItem: {
    marginBottom: SH(10),
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: SW(80),
  },
  imgContainer: {
    height: SW(50),
    width: SW(50),
    borderRadius: SW(25),
    overflow: "hidden"
  },
  img: {
    height: '100%',
    width: '100%',
    borderRadius: SW(25),
  },
  serviceTitle: {
    fontSize: SF(9),
    fontFamily: Fonts.MEDIUM,
    color: Colors.textHeader,
  },
  tickIcon: { position: "absolute", top: -8, right:16 }
});

export default UserprofileView;
