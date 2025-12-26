import { Dimensions, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get('window');
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

export const SW = (size: number): number => {
  return PixelRatio.roundToNearestPixel((width / guidelineBaseWidth) * size);
};

export const SH = (size: number): number => {
  return PixelRatio.roundToNearestPixel((height / guidelineBaseHeight) * size);
};

export const SF = (size: number): number => {
  const scale = Math.min(width / guidelineBaseWidth, height / guidelineBaseHeight);
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

export const heightPercent = (percent: number): number => {
  return PixelRatio.roundToNearestPixel((height * percent) / 100);
};

export const widthPercent = (percent: number): number => {
  return PixelRatio.roundToNearestPixel((width * percent) / 100);
};

export const fontPercent = (size: number): number => {
  const scale = Math.min(width / guidelineBaseWidth, height / guidelineBaseHeight);
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};
