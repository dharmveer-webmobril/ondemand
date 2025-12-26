import { Dimensions, PixelRatio } from "react-native";
import { Colors, Fonts } from "./constants"; // your Colors & Fonts

const { width, height } = Dimensions.get("screen");

// iPhone 11 baseline
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

// Scaling helpers
const SW = (size: number): number =>
  PixelRatio.roundToNearestPixel((width / guidelineBaseWidth) * size);

const SH = (size: number): number =>
  PixelRatio.roundToNearestPixel((height / guidelineBaseHeight) * size);

const SF = (size: number): number => {
  const scale = Math.min(width / guidelineBaseWidth, height / guidelineBaseHeight);
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

const heightPercent = (percent: number): number =>
  PixelRatio.roundToNearestPixel((height * percent) / 100);

const widthPercent = (percent: number): number =>
  PixelRatio.roundToNearestPixel((width * percent) / 100);

// 🎨 Centralized theme
export const defaultTheme = {
  colors: Colors,
  fonts: Fonts,

  device: {
    width,
    height,
  },

  fontSize: {
    xxs: SF(10),
    xs: SF(12),
    sm: SF(14),
    md: SF(16),
    lg: SF(18),
    xl: SF(20),
    xxl: SF(24),
    xxxl: SF(28),
    base: SF(16),
  },

  margins: {
    sm: SF(4),
    md: SF(8),
    lg: SF(16),
    xl: SF(24),
  },
  padding: {
    sm: SF(5),
    md: SF(8),
    lg: SF(16),
    xl: SF(24),
  },

  border: {
    xs: 8,
    sm: 10,
    md: 12,
    lg: 15,
    xl: 25,
    full: 200,
  },
  borderRadius: {
    sm: SF(4),
    md: SF(8),
    lg: SF(16),
    xl: SF(24),
  },

  size: {
    SW,
    SH,
    SF,
    heightPercent,
    widthPercent,
  },
  SW,
  SH,
  SF,
  heightPercent,
  widthPercent,
} as const;
