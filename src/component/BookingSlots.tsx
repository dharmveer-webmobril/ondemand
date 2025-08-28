import React from 'react';
import {
  View,
  Image,
  ImageProps,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Colors, Fonts, SF, SW } from '../utils';

import Spacing from './Spacing';
import AppText from './AppText';

type BookingSlotsProps = {
  slots: any[];
  selectedSlot: number;
  onSelect: (val: any) => void;
  isFetching?: boolean;
};

const seperatorComponent = () => <Spacing horizontal space={SW(10)} />;
const BookingSlots: React.FC<BookingSlotsProps> = ({ slots, selectedSlot = 0, onSelect, isFetching = false }) => {
  return (
    <>
      {
        isFetching ? <>
          <ActivityIndicator size={'large'} />
        </> :
          <FlatList
            data={slots || []}
            horizontal
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={seperatorComponent}
            contentContainerStyle={slots?.length <= 0 ? { flex: 1 } : {}}
            keyExtractor={(item, index) => `${index}-appointment-slots`}
            renderItem={({ item, index }) => {
              return <TouchableOpacity onPress={() => { onSelect(index) }} style={index === selectedSlot ? styles.slotsselected : styles.slots}>
                <AppText style={index == selectedSlot ? styles.selectedtxt : styles.txt}>{`${item?.start}-${item?.end}`}</AppText>
              </TouchableOpacity>
            }}
            ListEmptyComponent={
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 4 }}>
                <AppText style={{ color: Colors.textAppColor, textAlign: "center" }}>No Slots Available</AppText>
              </View>
            }
          />
      }
    </>

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
