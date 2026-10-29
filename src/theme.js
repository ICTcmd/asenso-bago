// Bago City App — Asenso Bago Design Tokens
// Updated with sophisticated burnt orange color system
export const colors = {
  // Primary burnt orange
  primary:       '#C96827',  // sophisticated burnt orange
  primaryHover:  '#AD541F',  // primary hover state
  primaryLight:  '#F3A15D',  // secondary accent

  // Backgrounds
  bg:            '#FFF7F0',  // warm ivory main background
  bgWhite:       '#FFFFFF',  // surface/card background
  bgCard:        '#FFFFFF',  // card background
  bgAccent:      '#F4E5D8',  // soft accent background

  // Text
  textPrimary:   '#282D32',  // main text (charcoal)
  textSecondary: '#62676D',  // secondary text (muted gray)
  textMuted:     '#888888',  // muted text
  textWhite:     '#ffffff',  // white text

  // Borders
  border:        '#E8DCD2',  // warm neutral borders

  // Status colors
  success:       '#2D5F3E',  // accessible dark green
  error:         '#9B2C2C',  // accessible dark red

  // Legacy colors (for backward compatibility)
  red:           '#C96827',  // now maps to primary
  redDark:       '#AD541F',  // now maps to primaryHover
  redLight:      '#F3A15D',  // now maps to primaryLight
  gold:          '#F3A15D',  // now maps to primaryLight
  navy:          '#282D32',  // now maps to textPrimary

  // Tab bar
  tabBg:         '#ffffff',
  tabBorder:     '#E8DCD2',
  tabActive:     '#C96827',  // burnt orange for active tab
  tabInactive:   '#62676D',  // muted gray for inactive
};

export const fonts = {
  regular: '400',
  medium:  '500',
  semibold:'600',
  bold:    '700',
  extrabold:'800',
  black:   '900',
};

export const radius = {
  sm:     8,
  md:     12,
  lg:     16,
  xl:     20,
  card:   16,
  btn:    14,   // slightly more rounded for modern feel
  icon:   16,
  pill:   50,
};

export const spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};
