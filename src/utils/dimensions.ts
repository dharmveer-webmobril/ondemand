// import { Dimensions, PixelRatio } from 'react-native';

// const { width, height } = Dimensions.get('window');
// const guidelineBaseWidth = 375;  // iPhone 11 width
// const guidelineBaseHeight = 812; // iPhone 11 height

// // Scale by width
// export const SW = (size: number): number => {
//   return PixelRatio.roundToNearestPixel((width / guidelineBaseWidth) * size);
// };

// // Scale by height
// export const SH = (size: number): number => {
//   return PixelRatio.roundToNearestPixel((height / guidelineBaseHeight) * size);
// };

// // Scale font size (based on smallest dimension)
// export const SF = (size: number): number => {
//   const scale = Math.min(width / guidelineBaseWidth, height / guidelineBaseHeight);
//   const newSize = size * scale;
//   return Math.round(PixelRatio.roundToNearestPixel(newSize));
// };

// // Percentage-based height
// export const heightPercent = (percent: number): number => {
//   return PixelRatio.roundToNearestPixel((height * percent) / 100);
// };

// // Percentage-based width
// export const widthPercent = (percent: number): number => {
//   return PixelRatio.roundToNearestPixel((width * percent) / 100);
// };

// // Font scaling (alternative version, density-adjusted)
// export const fontPercent = (size: number): number => {
//   const scale = Math.min(width / guidelineBaseWidth, height / guidelineBaseHeight);
//   const newSize = size * scale;
//   return Math.round(PixelRatio.roundToNearestPixel(newSize));
// };

import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// Base guideline (iPhone 11 dimensions)
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

// Tablet detection
export const isTablet = () => {
  const aspectRatio = height / width;
  return (Platform.OS === 'ios' && Platform.isPad) || width >= 768 || aspectRatio < 1.6;
};

// Clamp helper (prevents overscaling)
const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

// Width scaled value
export const SW = (size: number): number => {
  const scale = width / guidelineBaseWidth;
  const adjustedScale = isTablet() ? scale * 0.8 : scale; // shrink UI a bit on tablets
  return PixelRatio.roundToNearestPixel(size * adjustedScale);
};

// Height scaled value
export const SH = (size: number): number => {
  const scale = height / guidelineBaseHeight;
  const adjustedScale = isTablet() ? scale * 0.8 : scale;
  return PixelRatio.roundToNearestPixel(size * adjustedScale);
};

// Font scale (smallest dimension + tablet adjust)
export const SF = (size: number): number => {
  const scale = Math.min(width / guidelineBaseWidth, height / guidelineBaseHeight);
  const adjustedScale = isTablet() ? scale * 0.85 : scale; // fonts smaller on tablets
  const newSize = size * clamp(adjustedScale, 0.85, 1.25);
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Percentage height
export const heightPercent = (percent: number): number => {
  return PixelRatio.roundToNearestPixel((height * percent) / 100);
};

// Percentage width
export const widthPercent = (percent: number): number => {
  return PixelRatio.roundToNearestPixel((width * percent) / 100);
};

// Font percent scaling
export const fontPercent = (size: number): number => {
  const scale = Math.min(width / guidelineBaseWidth, height / guidelineBaseHeight);
  const adjustedScale = isTablet() ? scale * 0.85 : scale;
  const newSize = size * clamp(adjustedScale, 0.85, 1.25);
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};
