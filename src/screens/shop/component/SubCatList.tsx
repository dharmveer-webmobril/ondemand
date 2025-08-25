import { Pressable, FlatList, StyleSheet } from 'react-native';
import React, { useState, useMemo } from 'react';
import { Colors, Fonts, SF, SH, SW } from '../../../utils';
import { AppText } from '../../../component';

interface HeaderProps {
  data: any;
  setSelectedSubCatId: (id: string | null) => void;
  selectedSubCatId: string | null;
}

const SubCatList: React.FC<HeaderProps> = ({ data, setSelectedSubCatId, selectedSubCatId = null }) => {

  return (
    <FlatList
      data={data}
      horizontal
      contentContainerStyle={styles.listContainer}
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item, index) => `${item._id + item.name || index}`}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => { setSelectedSubCatId(item._id || null) }}
          style={[
            styles.button,
            {
              backgroundColor:
                selectedSubCatId === item._id ? Colors.themeColor : Colors.white,
            },
          ]}
        >
          <AppText
            style={[
              styles.text,
              { color: selectedSubCatId === item._id ? Colors.white : Colors.themeColor },
            ]}
          >
            {item.name}
          </AppText>
        </Pressable>
      )}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    marginTop: 10,
  },
  button: {
    paddingVertical: SH(5),
    paddingHorizontal: SW(10),
    borderRadius: SF(7),
    marginRight: SW(8),
  },
  text: {
    textDecorationLine: 'underline',
    fontFamily: Fonts.SEMI_BOLD,
    fontSize: SF(12),
  },
});

export default SubCatList;
