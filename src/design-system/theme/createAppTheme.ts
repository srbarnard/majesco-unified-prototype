import { createTheme } from '@mui/material/styles'
import {
  figmaColorsDark,
  figmaColorsLight,
} from '@/design-system/tokens/figma-colors'
import {
  createMuiTypography,
  figmaTypographyDesktop,
  figmaTypographyMobile,
} from '@/design-system/tokens/figma-typography'
import { figmaBorderRadius } from '@/design-system/tokens/figma-border-radius'
import { figmaBreakpoints } from '@/design-system/tokens/figma-breakpoints'
import { figmaPalette } from '@/design-system/tokens/figma-palette'
import { figmaSpacing } from '@/design-system/tokens/figma-spacing'
import { borderRadius, shadows, spacingUnit } from '@/design-system/tokens'
import { componentOverrides } from './componentOverrides'

/** Flattened Figma light tokens for convenient theme access. */
export const majescoTokens = {
  primary: figmaColorsLight.primary.main,
  primaryLight: figmaColorsLight.primary.light,
  primaryDark: figmaColorsLight.primary.dark,
  secondary: figmaColorsLight.secondary.main,
  secondaryDark: figmaColorsLight.secondary.dark,
  secondaryLight: figmaColorsLight.secondary.light,
  backgroundDefault: figmaColorsLight.background.default,
  backgroundGrey: figmaColorsLight.background.grey,
  backgroundPaper: figmaColorsLight.background.paper,
  textPrimary: figmaColorsLight.text.primary,
  textSecondary: figmaColorsLight.text.secondary,
  textDisabled: figmaColorsLight.text.disabled,
  divider: figmaColorsLight.divider,
  success: figmaColorsLight.success.main,
  error: figmaColorsLight.error.main,
  warning: figmaColorsLight.warning.main,
  info: figmaColorsLight.info.main,
  pastelBlue: figmaColorsLight.pastel.blue,
} as const

export const majescoTokensDark = {
  primary: figmaColorsDark.primary.main,
  primaryLight: figmaColorsDark.primary.light,
  primaryDark: figmaColorsDark.primary.dark,
  secondary: figmaColorsDark.secondary.main,
  secondaryDark: figmaColorsDark.secondary.dark,
  secondaryLight: figmaColorsDark.secondary.light,
  backgroundDefault: figmaColorsDark.background.default,
  backgroundGrey: figmaColorsDark.background.grey,
  backgroundPaper: figmaColorsDark.background.paper,
  textPrimary: figmaColorsDark.text.primary,
  textSecondary: figmaColorsDark.text.secondary,
  textDisabled: figmaColorsDark.text.disabled,
  divider: figmaColorsDark.divider,
  success: figmaColorsDark.success.main,
  error: figmaColorsDark.error.main,
  warning: figmaColorsDark.warning.main,
  info: figmaColorsDark.info.main,
  pastelBlue: figmaColorsDark.pastel.blue,
} as const

function createLightPalette() {
  return {
    mode: 'light' as const,
    primary: {
      main: figmaColorsLight.primary.main,
      light: figmaColorsLight.primary.light,
      dark: figmaColorsLight.primary.dark,
      contrastText: figmaColorsLight.primary.contrastText,
    },
    secondary: {
      main: figmaColorsLight.secondary.main,
      light: figmaColorsLight.secondary.light,
      dark: figmaColorsLight.secondary.dark,
      contrastText: figmaColorsLight.secondary.contrastText,
    },
    error: {
      main: figmaColorsLight.error.main,
      light: figmaColorsLight.error.light,
      dark: figmaColorsLight.error.dark,
      contrastText: figmaColorsLight.error.contrastText,
    },
    warning: {
      main: figmaColorsLight.warning.main,
      light: figmaColorsLight.warning.light,
      dark: figmaColorsLight.warning.dark,
      contrastText: figmaColorsLight.warning.contrastText,
    },
    info: {
      main: figmaColorsLight.info.main,
      light: figmaColorsLight.info.light,
      dark: figmaColorsLight.info.dark,
      contrastText: figmaColorsLight.info.contrastText,
    },
    success: {
      main: figmaColorsLight.success.main,
      light: figmaColorsLight.success.light,
      dark: figmaColorsLight.success.dark,
      contrastText: figmaColorsLight.success.contrastText,
    },
    text: {
      primary: figmaColorsLight.text.primary,
      secondary: figmaColorsLight.text.secondary,
      disabled: figmaColorsLight.text.disabled,
    },
    divider: figmaColorsLight.divider,
    background: {
      default: figmaColorsLight.background.default,
      paper: figmaColorsLight.background.paper,
    },
    action: {
      active: figmaColorsLight.action.active,
      hover: figmaColorsLight.action.hover,
      selected: figmaColorsLight.action.selected,
      focus: figmaColorsLight.action.focus,
      disabled: figmaColorsLight.action.disabled,
      disabledBackground: figmaColorsLight.action.disabledBackground,
    },
  }
}

function createDarkPalette() {
  return {
    mode: 'dark' as const,
    primary: {
      main: figmaColorsDark.primary.main,
      light: figmaColorsDark.primary.light,
      dark: figmaColorsDark.primary.dark,
      contrastText: figmaColorsDark.primary.contrastText,
    },
    secondary: {
      main: figmaColorsDark.secondary.main,
      light: figmaColorsDark.secondary.light,
      dark: figmaColorsDark.secondary.dark,
      contrastText: figmaColorsDark.secondary.contrastText,
    },
    error: {
      main: figmaColorsDark.error.main,
      light: figmaColorsDark.error.light,
      dark: figmaColorsDark.error.dark,
      contrastText: figmaColorsDark.error.contrastText,
    },
    warning: {
      main: figmaColorsDark.warning.main,
      light: figmaColorsDark.warning.light,
      dark: figmaColorsDark.warning.dark,
      contrastText: figmaColorsDark.warning.contrastText,
    },
    info: {
      main: figmaColorsDark.info.main,
      light: figmaColorsDark.info.light,
      dark: figmaColorsDark.info.dark,
      contrastText: figmaColorsDark.info.contrastText,
    },
    success: {
      main: figmaColorsDark.success.main,
      light: figmaColorsDark.success.light,
      dark: figmaColorsDark.success.dark,
      contrastText: figmaColorsDark.success.contrastText,
    },
    text: {
      primary: figmaColorsDark.text.primary,
      secondary: figmaColorsDark.text.secondary,
      disabled: figmaColorsDark.text.disabled,
    },
    divider: figmaColorsDark.divider,
    background: {
      default: figmaColorsDark.background.default,
      paper: figmaColorsDark.background.paper,
    },
    action: {
      active: figmaColorsDark.action.active,
      hover: figmaColorsDark.action.hover,
      selected: figmaColorsDark.action.selected,
      focus: figmaColorsDark.action.focus,
      disabled: figmaColorsDark.action.disabled,
      disabledBackground: figmaColorsDark.action.disabledBackground,
    },
  }
}

export const theme = createTheme(
  {
    cssVariables: {
      colorSchemeSelector: 'data',
    },
    colorSchemes: {
      light: {
        palette: createLightPalette(),
      },
      dark: {
        palette: createDarkPalette(),
      },
    },
    typography: createMuiTypography(),
    breakpoints: {
      values: figmaBreakpoints,
    },
    spacing: spacingUnit,
    shape: {
      borderRadius: borderRadius.default,
    },
    shadows: [...shadows],
    components: componentOverrides,
  },
  {
    majesco: majescoTokens,
    majescoDark: majescoTokensDark,
    figma: figmaColorsLight,
    figmaDark: figmaColorsDark,
    figmaTypography: figmaTypographyDesktop,
    figmaTypographyMobile,
    figmaSpacing,
    figmaBorderRadius,
    figmaPalette,
    figmaBreakpoints,
  },
)

declare module '@mui/material/styles' {
  interface Theme {
    majesco: typeof majescoTokens
    majescoDark: typeof majescoTokensDark
    figma: typeof figmaColorsLight
    figmaDark: typeof figmaColorsDark
    figmaTypography: typeof figmaTypographyDesktop
    figmaTypographyMobile: typeof figmaTypographyMobile
    figmaSpacing: typeof figmaSpacing
    figmaBorderRadius: typeof figmaBorderRadius
    figmaPalette: typeof figmaPalette
    figmaBreakpoints: typeof figmaBreakpoints
  }
}

export type AppTheme = typeof theme
