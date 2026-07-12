/**
 * Flawless Shadows Animation System
 * Consistent transitions and interactions across the app
 */

export const animations = {
  // Timing
  duration: {
    fast: 150,
    normal: 200,
    slow: 300,
  },
  
  // Easing functions (use with React Native Animated)
  easing: {
    easeInOut: 'ease-in-out',
    easeOut: 'ease-out',
    easeIn: 'ease-in',
  },
  
  // Opacity states
  opacity: {
    disabled: 0.5,
    hover: 0.9,
    active: 0.95,
    rest: 1,
  },
  
  // Scale transforms
  scale: {
    rest: 1,
    hover: 1.02,
    pressed: 0.98,
  },
  
  // Shadow elevation (pairs with shadow levels)
  elevation: {
    rest: 4,        // md shadow
    hover: 8,       // lg shadow
    active: 12,     // floating shadow
    pressed: 2,     // sm shadow
  },
} as const;

/**
 * Transition timing for animations
 * Use in Animated.timing() or style transitions
 */
export const transitionConfig = {
  default: {
    duration: animations.duration.normal,
    useNativeDriver: false, // React Native requires false for shadow/elevation
  },
  fast: {
    duration: animations.duration.fast,
    useNativeDriver: false,
  },
  slow: {
    duration: animations.duration.slow,
    useNativeDriver: false,
  },
} as const;

export type AnimationDuration = keyof typeof animations.duration;
export type TransitionConfig = typeof transitionConfig.default;
