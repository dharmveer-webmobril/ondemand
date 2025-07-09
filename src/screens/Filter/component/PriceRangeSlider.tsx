import { View, Text, StyleSheet } from 'react-native';
import React, { FC, useCallback } from 'react';
import { AppText, Spacing } from '../../../component';
import { Colors, Fonts, SF, SH, SW } from '../../../utils';
import RangeSlider from 'rn-range-slider';

// Interface for props
interface PriceRangeSliderProps {
  minPrice: number;
  maxPrice: number;
  onPriceChange: (low: number, high: number) => void;
}

const PriceRangeSlider: FC<PriceRangeSliderProps> = ({ minPrice, maxPrice, onPriceChange }) => {
  const renderThumb = useCallback(() => <View style={styles.thumb} />, []);

  const renderRail = useCallback(() => <View style={styles.rail} />, []);

  const renderRailSelected = useCallback(() => <View style={styles.railSelected} />, []);

  const renderLabel = useCallback(
    (value: number) => (
      <View style={styles.labelContainer}>
        <AppText style={styles.labelText}>${value}</AppText>
      </View>
    ),
    []
  );

  const renderNotch = useCallback(() => <View style={styles.notch} />, []);

  const handleValueChange = useCallback(
    (low: number, high: number) => {
      onPriceChange(low, high);
    },
    [onPriceChange]
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <AppText style={styles.headerText}>Price Range</AppText>
        <AppText style={styles.priceRangeText}>
          ${minPrice}-${maxPrice}
        </AppText>
      </View>
      <Spacing space={SH(10)} />
      <RangeSlider
        style={styles.slider}
        min={0}
        max={1000}
        step={10}
        floatingLabel
        renderThumb={renderThumb}
        renderRail={renderRail}
        renderRailSelected={renderRailSelected}
        renderLabel={renderLabel}
        renderNotch={renderNotch}
        onValueChanged={handleValueChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: SH(10),
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerText: {
    color: Colors.themeColor,
    fontFamily: Fonts.MEDIUM,
    fontSize: SF(12),
  },
  priceRangeText: {
    color: Colors.themeColor,
    fontFamily: Fonts.MEDIUM,
    fontSize: SF(12),
  },
  slider: {
    width: '100%',
    height: SH(50),
  },
  thumb: {
    width: SW(20),
    height: SW(20),
    borderRadius: SW(10),
    backgroundColor: Colors.themeColor,
    borderColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  rail: {
    flex: 1,
    height: SH(4),
    borderRadius: SW(2),
    backgroundColor: Colors.white,
  },
  railSelected: {
    height: SH(4),
    backgroundColor: Colors.themeColor,
    borderRadius: SW(2),
  },
  labelContainer: {
    backgroundColor: Colors.themeColor,
    borderRadius: SW(5),
    paddingHorizontal: SW(8),
    paddingVertical: SH(4),
    marginBottom: SH(5),
  },
  labelText: {
    color: Colors.white,
    fontSize: SF(12),
    fontFamily: Fonts.MEDIUM,
  },
  notch: {
    width: SW(8),
    height: SH(8),
    borderLeftWidth: SW(4),
    borderRightWidth: SW(4),
    borderTopWidth: SH(4),
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.themeColor,
  },
});

export default PriceRangeSlider;