/**
 * Design tokens e palette per WorkoutTrackerIT.
 * Dark-First Utility theme.
 */

export const colors = {
  surface: "#111113",
  onSurface: "#F2F2F2",
  surfaceSecondary: "#1C1C1E",
  onSurfaceSecondary: "#A1A1A5",
  surfaceTertiary: "#2C2C2E",
  onSurfaceTertiary: "#8E8E93",
  surfaceInverse: "#F2F2F2",
  onSurfaceInverse: "#111113",
  brand: "#D9654B",
  brandPrimary: "#D9654B",
  onBrandPrimary: "#FFFFFF",
  brandSecondary: "#3A231E",
  onBrandSecondary: "#D9654B",
  brandTertiary: "#261B19",
  success: "#729B79",
  warning: "#E0A96D",
  error: "#C25953",
  info: "#6D8EA0",
  border: "#2C2C2E",
  borderStrong: "#3A3A3C",
  divider: "#2C2C2E",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const radius = {
  sm: 6,
  md: 12,
  lg: 20,
  pill: 999,
};

export const typography = {
  // Use system fonts for reliability (no external CDN required).
  // Bold + tight letter spacing emulates the condensed athletic feel.
  display: undefined as string | undefined,
  text: undefined as string | undefined,
  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 20,
    xxl: 26,
    xxxl: 34,
    huge: 56,
  },
};
