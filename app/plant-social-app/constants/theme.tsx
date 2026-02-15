/**
 * Plant Social Theme - Nature-inspired colors for plant care
 */

import { Platform } from 'react-native';

// Plant-inspired color palette
const tintColorLight = '#2D6A4F'; // Forest green
const tintColorDark = '#95D5B2'; // Mint green

export const Colors = {
  light: {
    text: '#1B4332',
    textSecondary: '#52796F',
    background: '#F8FAF9',
    cardBackground: '#FFFFFF',
    tint: tintColorLight,
    icon: '#52796F',
    tabIconDefault: '#84A98C',
    tabIconSelected: tintColorLight,
    accent: '#40916C',
    accentLight: '#D8F3DC',
    border: '#E8F0EB',
    success: '#40916C',
    warning: '#E9C46A',
    danger: '#E76F51',
  },
  dark: {
    text: '#D8F3DC',
    textSecondary: '#95D5B2',
    background: '#0D1B14',
    cardBackground: '#1B2E23',
    tint: tintColorDark,
    icon: '#74C69D',
    tabIconDefault: '#52796F',
    tabIconSelected: tintColorDark,
    accent: '#74C69D',
    accentLight: '#1B4332',
    border: '#2D3E35',
    success: '#74C69D',
    warning: '#E9C46A',
    danger: '#E76F51',
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
