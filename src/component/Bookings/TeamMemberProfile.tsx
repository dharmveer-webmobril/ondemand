import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppText, ImageLoader, VectoreIcons } from '../../component';
import { Colors, Fonts,   SF, SH, SW } from '../../utils';

interface Props {
  title?: string;
  imageSource?: any;
  selectedMember: string | null
  onClick?: () => void; // define proper type if you have item model
  item?: any; // pass whole item from parent
}

const TeamMemberProfile: React.FC<Props> = ({
  title = '',
  imageSource = null,
  selectedMember = null,
  onClick = () => { },
  item,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.serviceItem}
      onPress={() => onClick()} // 🔥 send item back to parent
    >
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
      {selectedMember === item?._id && (
        <View style={styles.tickIcon}>
          <VectoreIcons
            icon="AntDesign"
            name="checkcircle"
            color="green"
            size={SF(18)}
          />
        </View>
      )}
    </TouchableOpacity>
  );
};
export default TeamMemberProfile;

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
    overflow: 'hidden',
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
  tickIcon: { position: 'absolute', top: -8, right: 16 },
});
