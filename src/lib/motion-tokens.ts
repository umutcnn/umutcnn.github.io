/**
 * Single source of motion timing. Mirrored as CSS custom properties in styles/tokens.css
 * (--dur-fast, --dur-normal, --dur-emphasis, --dur-cinematic, --ease-out, --ease-in-out).
 */
export const DURATION = {
  fast: 0.15,
  normal: 0.28,
  emphasis: 0.56,
  cinematic: 0.96,
} as const;

export const EASE = {
  /** expo-like deceleration — reveals, entrances */
  out: [0.16, 1, 0.3, 1] as const,
  /** quart in-out — morphs, page transitions */
  inOut: [0.76, 0, 0.24, 1] as const,
} as const;

export const STAGGER = {
  letters: 0.04,
  items: 0.08,
} as const;

/** GSAP accepts CSS-like cubic-bezier strings via CustomEase only; these named eases are close equivalents. */
export const GSAP_EASE = {
  out: 'expo.out',
  inOut: 'power4.inOut',
} as const;
