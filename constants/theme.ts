/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

export const Brand = {
  red: '#E1251B',
  redDark: '#B81F18',
  navy: '#101820',
  blue: '#1D4ED8',
  cream: '#F6F3EE',
  surface: '#FFFFFF',
  surfaceMuted: '#ECE8E1',
  text: '#17202A',
  textMuted: '#667085',
  border: '#DED8CF',
  success: '#087A55',
  danger: '#B42318',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const Radius = {
  sm: 10,
  md: 16,
  lg: 24,
  pill: 999,
} as const;

export const Colors = {
  light: {
    text: Brand.text,
    background: Brand.cream,
    tint: Brand.red,
    icon: Brand.textMuted,
    tabIconDefault: Brand.textMuted,
    tabIconSelected: Brand.red,
  },
  dark: {
    text: '#F9FAFB',
    background: '#0B1117',
    tint: '#FF5A52',
    icon: '#98A2B3',
    tabIconDefault: '#98A2B3',
    tabIconSelected: '#FF5A52',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
