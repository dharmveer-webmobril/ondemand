import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { boxShadowlight, Colors, Fonts, SF, SH, SW } from '../../utils';
import imagePaths from '../../assets/images';
import ImageLoader from '../ImageLoader';
import StarRating from 'react-native-star-rating-widget';
import Divider from '../Divider';
import AppText from '../AppText';

type PaymentHistoryItemProps = {
  item: {
    name: string;
    id: number;
    onClick?: () => void;
    datetime?: string;
    price: string | number;
  };
};

const PaymentHistoryItem: React.FC<PaymentHistoryItemProps> = ({ item }) => {
  return (
    <TouchableOpacity activeOpacity={1} style={styles.container}>
      <View style={styles.row}>
        <View style={[styles.leftContainer, boxShadowlight]}>
          <ImageLoader
            source={imagePaths.makup1}
            resizeMode="cover"
            mainImageStyle={styles.leftImage}
          />
        </View>
        <View style={styles.itemDetails}>
          <AppText style={styles.text}>{item.name}</AppText>
          <AppText style={styles.textprice}>{item.price}   <AppText style={styles.textprice1}>$100</AppText></AppText>
        </View>
      </View>
      <View style={styles.reviewContainer}>
        <View style={styles.yourCommentBox}>
          <AppText style={styles.textYour}>{'Your Comment'}</AppText>
          <View style={{flexDirection:"row",alignItems:'center', }}>
            <Image source={imagePaths.trash_icon} style={{height:SF(14),width:SF(14)}}/>
            <Image source={imagePaths.edit_icon} style={{height:SF(14),width:SF(14),marginLeft:SF(10)}}/>
          </View>
        </View>
        <View style={styles.reviewHeader}>
          <View style={styles.ratingContainer}>
            <StarRating
              starStyle={styles.starStyle}
              onChange={() => { }}
              starSize={SF(16)}
              color={Colors.ratingColor1}
              rating={3.5}
            />
            <AppText style={styles.ratingtxt}>{'4.6'}</AppText>
          </View>
          <AppText style={styles.reviewDate}>25 Jan</AppText>
        </View>
        <AppText style={styles.reviewText}>
        Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet.
        </AppText>
      </View>
    </TouchableOpacity>
  );
};

export default PaymentHistoryItem;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.themelight,
    borderRadius: SF(10),
    paddingVertical: SW(12),
    paddingHorizontal:SW(12)
  },
  row: {
    flexDirection: 'row',
  },
  itemDetails: {
    marginLeft: SW(12),
    flex: 1,
  },
  text: {
    marginTop: 2,
    fontFamily: Fonts.SEMI_BOLD,
    fontSize: SF(16),
    color: Colors.textAppColor,
  },
  textYour: {
    marginTop: 2,
    fontFamily: Fonts.MEDIUM,
    fontSize: SF(14),
    color: Colors.textAppColor,
  },
  textprice: {
    fontFamily: Fonts.MEDIUM,
    fontSize: SF(16),
    color: Colors.themeColor,
    marginTop: SH(4),
  },
  textprice1: {
    fontFamily: Fonts.REGULAR,
    fontSize: SF(16),
    color: '#B3B3B3',
    textDecorationLine: "line-through",
  },
  reviewContainer: {
    backgroundColor: Colors.bgwhite,
    padding: SF(12),
    borderRadius: SF(10),
    marginTop: SF(10),
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    width: SW(90),
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
  },
  starStyle: {
    marginHorizontal: 0,
  },
  ratingtxt: {
    color: '#6C757D',
    fontFamily: Fonts.MEDIUM,
    marginLeft: 5,
    fontSize: SF(14),
  },
  reviewDate: {
    fontFamily: Fonts.MEDIUM,
    color: '#6C757D',
    textAlign: 'right',
    fontSize: SF(14),
  },
  reviewText: {
    fontFamily: Fonts.MEDIUM,
    color: '#6C757D',
    textAlign: 'left',
    marginTop: SH(9),
    fontSize: SF(14),
    lineHeight: SF(20)
  },
  leftContainer: {
    borderRadius: SF(10),
    width: SF(107),
    height: SF(81),
    overflow: "hidden"
  },
  leftImage: {
    width: '100%',
    height: '100%',
  },
  yourCommentBox:{ borderBottomWidth: 1, borderBottomColor: '#EBEBEB', paddingBottom: SH(20), marginBottom: SF(20), flexDirection: "row", alignItems: "center",justifyContent:'space-between' }
});
