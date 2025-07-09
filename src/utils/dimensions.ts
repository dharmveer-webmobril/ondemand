import { Dimensions, PixelRatio } from 'react-native';

// Base dimensions for iPhone 11 (or similar)
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

// Always use fresh dimensions (no static let/const for width/height)
const getScreenWidth = () => Dimensions.get('window').width;
const getScreenHeight = () => Dimensions.get('window').height;

// Width scaled value
export const SW = (size: number): number => {
  return (getScreenWidth() / guidelineBaseWidth) * size;
};

// Height scaled value
export const SH = (size: number): number => {
  return (getScreenHeight() / guidelineBaseHeight) * size;
};

// Font scale
export const SF = (size: number): number => {
  let scale1 = getScreenWidth();
  if (getScreenWidth() > getScreenHeight()) {
    scale1 = getScreenHeight()
  }
  const scale = scale1 / guidelineBaseWidth;
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Pure percentage height
export const heightPercent = (percent: number): number => {
  return (getScreenHeight() * percent) / 100;
};

// Pure percentage width
export const widthPercent = (percent: number): number => {
  return (getScreenWidth() * percent) / 100;
};

// Font scale based on smallest dimension
export const fontPercent = (size: number): number => {
  const scale = Math.min(
    getScreenWidth() / guidelineBaseWidth,
    getScreenHeight() / guidelineBaseHeight
  );
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};
