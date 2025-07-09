import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Colors, Fonts, SF, SH, SW} from '../../utils';
import imagePaths from '../../assets/images';
import AppText from '../AppText';

type ProfileListProps = {
  item: {
    name: string;
    id: number;
    onClick?: () => void;
  };
};

const ProfileList: React.FC<ProfileListProps> = ({item}) => {
  return (
    <TouchableOpacity onPress={item.onClick} style={styles.container}>
      <AppText style={styles.text}>{item.name}</AppText>
      <Image
        source={imagePaths.right_icon}
        style={styles.icon}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
};

export default ProfileList;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.themelight,
    height: SF(45),
    justifyContent: 'space-between',
    paddingRight: SW(15),
    paddingLeft: SW(25),
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
  },
  text: {
    fontFamily: Fonts.MEDIUM,
    fontSize: SF(14),
    color: Colors.textAppColor,
  },
  icon: {
    height: SF(18),
    width: SF(18),
  },
});
