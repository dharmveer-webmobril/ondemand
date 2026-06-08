import type { ViewStyle } from 'react-native';

/** Squared bento corner radius */
export const HOME_BENTO_RADIUS = 12;

/** Light sky-blue gradient for filter + AI chat */
export const SKY_GRADIENT_COLORS = ['#E0F2FE', '#BAE6FD', '#7DD3FC'] as const;
export const SKY_GRADIENT_LOCATIONS = [0, 0.35, 1] as const;

/** White search field — matches header mock */
export const HOME_SEARCH_SHADOW: ViewStyle = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 5,
  elevation: 4,
};

/** Liquid spring — soft squash on press */
export const LIQUID_SPRING = {
  damping: 14,
  stiffness: 220,
  mass: 0.65,
};

export const LIQUID_RELEASE_SPRING = {
  damping: 12,
  stiffness: 180,
  mass: 0.55,
};

/** Light bento tile shadow */
export const HOME_BENTO_SHADOW: ViewStyle = {
  shadowColor: '#0C4A6E',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 3,
};

/** Floating glass control shadow (soft, light sky) */
export const HOME_FLOATING_SHADOW: ViewStyle = {
  shadowColor: '#7DD3FC',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.35,
  shadowRadius: 10,
  elevation: 8,
};

export const GLASS_BORDER: ViewStyle = {
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.75)',
};

export const GLASS_OVERLAY: ViewStyle = {
  backgroundColor: 'rgba(255,255,255,0.38)',
};
