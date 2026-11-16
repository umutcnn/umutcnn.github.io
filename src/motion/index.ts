/**
 * Motion system — single entry point. Every animated component imports from here, so behaviour (reduced motion,
 * quality tiers, visibility pausing, shared pointer) is decided in one place. See docs/V2_MOTION_ARCHITECTURE.md.
 */
export { useReducedMotion, useFinePointer } from '../lib/prefs';
export {
  useReveal as useScrollReveal,
  useInView,
  useVisibility as useElementVisibility,
  observeReveal,
} from '../hooks/useReveal';
export {
  useAnimationQuality,
  getAnimationQuality,
  resolveQuality,
  QUALITY_BUDGET,
  type AnimationQuality,
} from './quality';
export { usePointerPosition, useMagneticInteraction } from './interaction';
export { usePageTransition, runPageTransition } from './page-transition';
export { DURATION, EASE, STAGGER, GSAP_EASE } from '../lib/motion-tokens';
