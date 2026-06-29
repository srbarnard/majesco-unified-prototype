import type { ThemeOptions } from '@mui/material/styles'
import type { ResponsiveStyleValue } from '@mui/system'

/**
 * Majesco Figma typography tokens.
 * Source: Figma variables export — desktop & mobile modes.
 */

export type FigmaTypographyMode = 'desktop' | 'mobile'

export const figmaFontFamilies = {
  heading: 'Poppins',
  body: 'Open Sans',
} as const

export const figmaFontFamilyStack = {
  heading: '"Poppins", "Helvetica Neue", Arial, sans-serif',
  body: '"Open Sans", "Helvetica Neue", Arial, sans-serif',
} as const

export const figmaFontWeights = {
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const

/** Font size scale — keys match Figma `_fontSize` tokens (px values). */
const figmaFontSizeScale = {
  '0.625rem': '0.625rem', // 10px
  '0.75rem': '0.75rem', // 12px
  '0.8125rem': '0.8125rem', // 13px
  '0.875rem': '0.875rem', // 14px
  '0.9375rem': '0.9375rem', // 15px
  '1rem': '1rem', // 16px
  '1.125rem': '1.125rem', // 18px
  '1.25rem': '1.25rem', // 20px
  '1.5rem': '1.5rem', // 24px
  '1.5625rem': '1.5625rem', // 25px
  '2rem': '2rem', // 32px
  '2.125rem': '2.125rem', // 34px
  '2.375rem': '2.375rem', // 38px
  '3rem': '3rem', // 48px
  '3.5rem': '3.5rem', // 56px
  '3.75rem': '3.75rem', // 60px
  '6rem': '6rem', // 96px
} as const

const createTypographyScale = () =>
  ({
    h1: figmaFontSizeScale['1.5rem'],
    h2: figmaFontSizeScale['1.25rem'],
    h3: figmaFontSizeScale['1.125rem'],
    h4: figmaFontSizeScale['1rem'],
    h5: figmaFontSizeScale['0.875rem'],
    h6: figmaFontSizeScale['0.8125rem'],
    body1: figmaFontSizeScale['1rem'],
    body2: figmaFontSizeScale['0.875rem'],
    subtitle1: figmaFontSizeScale['1rem'],
    subtitle2: figmaFontSizeScale['0.875rem'],
    overline: figmaFontSizeScale['0.75rem'],
    caption: figmaFontSizeScale['0.75rem'],
    button: figmaFontSizeScale['1rem'],
  }) as const

/** MUI variant font sizes — desktop mode. */
export const figmaTypographyDesktop = createTypographyScale()

/** MUI variant font sizes — mobile mode. */
export const figmaTypographyMobile = createTypographyScale()

/** @deprecated Use `figmaTypographyDesktop` or `getFigmaTypography()`. */
export const figmaTypographyScale = figmaTypographyDesktop

export const figmaFontSizeScaleDesktop = figmaFontSizeScale
export const figmaFontSizeScaleMobile = figmaFontSizeScale

export type FigmaTypographyScale = typeof figmaTypographyDesktop

export const figmaTypography = {
  desktop: figmaTypographyDesktop,
  mobile: figmaTypographyMobile,
} as const

export function getFigmaTypography(
  mode: FigmaTypographyMode = 'desktop',
): FigmaTypographyScale {
  return figmaTypography[mode]
}

export const lineHeights = {
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
} as const

export const letterSpacings = {
  tight: '-0.01em',
  normal: '0',
  wide: '0.02em',
  overline: '0.08em',
} as const

function responsiveFontSize(
  mobile: string,
  desktop: string,
): ResponsiveStyleValue<string> {
  return mobile === desktop ? mobile : { xs: mobile, md: desktop }
}

/** Build MUI typography from Figma desktop + mobile scales. */
export function createMuiTypography(): ThemeOptions['typography'] {
  const mobile = figmaTypographyMobile
  const desktop = figmaTypographyDesktop

  return {
    fontFamily: figmaFontFamilyStack.body,
    h1: {
      fontFamily: figmaFontFamilyStack.heading,
      fontWeight: figmaFontWeights.semibold,
      fontSize: responsiveFontSize(mobile.h1, desktop.h1),
      lineHeight: lineHeights.tight,
      letterSpacing: letterSpacings.tight,
    },
    h2: {
      fontFamily: figmaFontFamilyStack.heading,
      fontWeight: figmaFontWeights.semibold,
      fontSize: responsiveFontSize(mobile.h2, desktop.h2),
      lineHeight: lineHeights.tight,
      letterSpacing: letterSpacings.tight,
    },
    h3: {
      fontFamily: figmaFontFamilyStack.heading,
      fontWeight: figmaFontWeights.semibold,
      fontSize: responsiveFontSize(mobile.h3, desktop.h3),
      lineHeight: lineHeights.snug,
    },
    h4: {
      fontFamily: figmaFontFamilyStack.heading,
      fontWeight: figmaFontWeights.medium,
      fontSize: responsiveFontSize(mobile.h4, desktop.h4),
      lineHeight: lineHeights.snug,
    },
    h5: {
      fontFamily: figmaFontFamilyStack.heading,
      fontWeight: figmaFontWeights.medium,
      fontSize: responsiveFontSize(mobile.h5, desktop.h5),
      lineHeight: lineHeights.normal,
    },
    h6: {
      fontFamily: figmaFontFamilyStack.body,
      fontWeight: figmaFontWeights.semibold,
      fontSize: responsiveFontSize(mobile.h6, desktop.h6),
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacings.wide,
      textTransform: 'uppercase',
    },
    subtitle1: {
      fontFamily: figmaFontFamilyStack.body,
      fontWeight: figmaFontWeights.medium,
      fontSize: responsiveFontSize(mobile.subtitle1, desktop.subtitle1),
      lineHeight: lineHeights.normal,
    },
    subtitle2: {
      fontFamily: figmaFontFamilyStack.body,
      fontWeight: figmaFontWeights.medium,
      fontSize: responsiveFontSize(mobile.subtitle2, desktop.subtitle2),
      lineHeight: lineHeights.normal,
    },
    body1: {
      fontFamily: figmaFontFamilyStack.body,
      fontWeight: figmaFontWeights.regular,
      fontSize: responsiveFontSize(mobile.body1, desktop.body1),
      lineHeight: lineHeights.normal,
    },
    body2: {
      fontFamily: figmaFontFamilyStack.body,
      fontWeight: figmaFontWeights.regular,
      fontSize: responsiveFontSize(mobile.body2, desktop.body2),
      lineHeight: lineHeights.normal,
    },
    button: {
      fontFamily: figmaFontFamilyStack.heading,
      fontWeight: figmaFontWeights.medium,
      fontSize: responsiveFontSize(mobile.button, desktop.button),
      lineHeight: lineHeights.normal,
      textTransform: 'none',
      letterSpacing: letterSpacings.normal,
    },
    caption: {
      fontFamily: figmaFontFamilyStack.body,
      fontWeight: figmaFontWeights.regular,
      fontSize: responsiveFontSize(mobile.caption, desktop.caption),
      lineHeight: lineHeights.normal,
    },
    overline: {
      fontFamily: figmaFontFamilyStack.body,
      fontWeight: figmaFontWeights.semibold,
      fontSize: responsiveFontSize(mobile.overline, desktop.overline),
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacings.overline,
      textTransform: 'uppercase',
    },
  } as ThemeOptions['typography']
}
