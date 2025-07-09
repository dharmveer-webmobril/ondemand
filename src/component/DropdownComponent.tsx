import React, { FC, useState } from 'react';
import { StyleSheet, View, Text, Image, ViewStyle, TextStyle } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Colors, Fonts, SF, SH } from '../utils';
import imagePaths from '../assets/images';
import AppText from './AppText';

interface DropdownComponentProps {
  data: any;
  dropdown?: ViewStyle;
  selectedTextStyle?: TextStyle;
  placeholderText?: string;
  selectedvalue?: string | null;
  placeholderStyle?: TextStyle;
  isDisable?: boolean;
}

const DropdownComponent: FC<DropdownComponentProps> = ({ data, selectedTextStyle, dropdown, placeholderStyle, placeholderText = "Select value", selectedvalue = null,isDisable=false}) => {
  const [value, setValue] = useState(null);

  const renderItem = (item: any) => {
    return (
      <View style={styles.item}>
        <AppText style={styles.textItem}>{item.label}</AppText>
      </View>
    );
  };

  return (
    <Dropdown
    disable={isDisable}
      style={[styles.dropdown, dropdown]}
      placeholderStyle={[styles.placeholderStyle, placeholderStyle]}
      selectedTextStyle={[styles.selectedTextStyle, selectedTextStyle]}
      inputSearchStyle={styles.inputSearchStyle}
      iconStyle={styles.iconStyle}
      data={data}
      search={false}
      maxHeight={300}
      labelField="label"
      valueField="value"
      placeholder={placeholderText}
      containerStyle={{marginTop:8,borderRadius:12,paddingBottom:20}}
      searchPlaceholder="Search..."
      value={selectedvalue}
      onChange={item => {
        setValue(item.value);
      }}
      renderItem={renderItem}
    />
  );
};

export default DropdownComponent;

const styles = StyleSheet.create({
  dropdown: {
    // height: SH(43),
    backgroundColor: '#F2F2F2',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.textAppColor,
  },
  icon: {
    marginRight: 5,
  },
  item: {
    padding: 17,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
 
  },
  textItem: {
    flex: 1,
    fontSize: SF(12),
    fontFamily: Fonts.REGULAR,
    color: Colors.textAppColor
  },
  placeholderStyle: {
    fontSize: SF(12),
    fontFamily: Fonts.REGULAR,
    color: '#7F7F7F'
  },
  selectedTextStyle: {
    fontSize: SF(12),
    fontFamily: Fonts.REGULAR,
    color: Colors.textAppColor
  },
  iconStyle: {
    width: 12,
    height: 12,
  },
  inputSearchStyle: {
    height: SH(42),
    fontSize: SF(16),
    color: Colors.textAppColor
  },
});