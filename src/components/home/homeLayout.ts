import type { ViewStyle } from 'react-native';
import { HOME_BENTO_SHADOW } from './bentoEffects';

/** Shared horizontal inset — headers, banner, search, and horizontal lists align to this. */
export const HOME_HORIZONTAL_PADDING = 16;

/** Unified bento card elevation (re-export for existing imports). */
export const HOME_CARD_SHADOW: ViewStyle = HOME_BENTO_SHADOW;
