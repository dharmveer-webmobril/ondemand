/** Matches `logo_gif.json` composition (92 frames @ 25fps). */
export const SPLASH_LOTTIE_FRAMES = 92;
export const SPLASH_LOTTIE_FPS = 25;
export const SPLASH_LOTTIE_DURATION_MS =
  (SPLASH_LOTTIE_FRAMES / SPLASH_LOTTIE_FPS) * 1000;

/** Text fade starts ~24 frames in, aligned with the GIF/Lottie reveal. */
export const SPLASH_TEXT_DELAY_MS = Math.round(
  (24 / SPLASH_LOTTIE_FPS) * 1000,
);
export const SPLASH_TEXT_FADE_MS = 2000;
