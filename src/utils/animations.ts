import { Easing } from 'react-native-reanimated';

/** Shared motion tokens for consistent, professional (no-bounce) UI animations. */
export const STAGGER_MS = 45;
export const MAX_STAGGER_ITEMS = 12;
export const SCREEN_ENTER_MS = 280;
export const PRESS_DURATION_MS = 110;
export const RELEASE_DURATION_MS = 140;
export const PRESS_SCALE = 0.98;

/** Smooth deceleration curve — clean entrance, no overshoot/bounce. */
export const ENTER_EASING = Easing.out(Easing.cubic);
export const PRESS_EASING = Easing.out(Easing.quad);

export function staggerDelay(index = 0, stepMs = STAGGER_MS): number {
  return Math.min(Math.max(index, 0), MAX_STAGGER_ITEMS) * stepMs;
}
