import React from 'react';
import {
  View,
  Image,
  ImageProps,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Colors, Fonts, SF, SW } from '../utils';
 
import Spacing from './Spacing';
import AppText from './AppText';

type BookingSlotsProps = {
  slots: any[];
  selectedSlot:number;
  onSelect: (val: any) => void;
};

const seperatorComponent = () => <Spacing horizontal space={SW(10)} />;

const BookingSlots: React.FC<BookingSlotsProps> = ({ slots,selectedSlot=0,onSelect }) => {
  return (
    <FlatList
      data={slots}
      horizontal
      showsHorizontalScrollIndicator={false}
      ItemSeparatorComponent={seperatorComponent}

      renderItem={({ item, index }) => {
        return <TouchableOpacity onPress={()=>{onSelect(item.id)}} style={selectedSlot==item.id?styles.slotsselected:styles.slots}>
          <AppText  style={selectedSlot==item.id?styles.selectedtxt:styles.txt}>{item.time}</AppText>
        </TouchableOpacity>
      }}
    />

  );
};

export default BookingSlots;
const styles = StyleSheet.create({
  slots: {
    backgroundColor: '#F2F2F2',
    paddingHorizontal: SW(10),
    paddingVertical: SW(10),
    borderRadius: SW(10)
  },
  slotsselected: {
    backgroundColor: Colors.themeColor,
    paddingHorizontal: SW(10),
    paddingVertical: SW(10),
    borderRadius: SW(10)
  },
  txt: {
    color: Colors.switchOff,
    fontSize: SF(12),
    fontFamily: Fonts.SEMI_BOLD
  },
  selectedtxt: {
    color: Colors.white,
    fontSize: SF(12),
    fontFamily: Fonts.SEMI_BOLD
  },
})
