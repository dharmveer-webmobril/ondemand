import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Colors, Fonts, SF, SH, SW} from '../../utils';
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

const PaymentHistoryItem: React.FC<PaymentHistoryItemProps> = ({item}) => {
  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={item.onClick}
      style={styles.container}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <AppText style={styles.text}>{item.name}</AppText>
        <AppText style={styles.text2}>{item?.datetime}</AppText>
      </View>
      <AppText style={styles.textprice}>{item.price}</AppText>
      <AppText style={styles.textStatus}>{'Pending'}</AppText>
    </TouchableOpacity>
  );
};

export default PaymentHistoryItem;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.themelight,
    borderRadius: 10,
    padding:SW(12)
  },
  text: {
    fontFamily: Fonts.SEMI_BOLD,
    fontSize: SF(15),
    color: Colors.textAppColor,
  },
  text2: {
    fontFamily: Fonts.MEDIUM,
    fontSize: SF(12),
    color: Colors.textAppColor,
  },
  textprice: {
    fontFamily: Fonts.BOLD,
    fontSize: SF(16),
    marginTop: SH(7),
    color: Colors.textAppColor,
  },
  textStatus: {
    fontFamily: Fonts.REGULAR,
    fontSize: SF(12),
    marginTop: SH(7),
    color: Colors.textAppColor,
  },
});
