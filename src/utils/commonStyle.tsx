

import { StyleSheet } from 'react-native';

export const commonStyles = StyleSheet.create({
  rowSpaceBetweenCss: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "space-between",
  },
});



export const boxShadow = {
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 7,
  },
  shadowOpacity: 0.2,
  shadowRadius: 10,
  elevation: 5, // Android only
};

export const boxShadowlight = {
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 1,
  },
  shadowOpacity: 0.1,
  shadowRadius: 3,
  elevation: 2,
};

export const centerCss = {
  flexDirection: "row",
  justifyContent: "center",
  alignItems: 'center'
}
export const rowSpaceBetweenCss = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: "space-between",
}
export const rowFlexStartCss = {
  flexDirection: "row",
  justifyContent: "flex-start",
  alignItems: 'center'
}
export const rowFlexEndCss = {
  flexDirection: "row",
  justifyContent: "flex-end",
  alignItems: 'center'
}

export const $paddingHorizontal = {
  paddingHorizontal: '5%'
}
export const $marginHorizontal = {
  marginHorizontal: '5%'
}

