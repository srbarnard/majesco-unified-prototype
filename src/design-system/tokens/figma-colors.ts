/**
 * Majesco Figma design tokens.
 * Source: Figma variables export — material/theme light & dark.
 */

export const figmaColorsLight = {
  divider: 'rgba(0, 0, 0, 0.12)',

  text: {
    primary: 'rgba(0, 0, 0, 0.87)',
    secondary: 'rgba(0, 0, 0, 0.6)',
    disabled: 'rgba(0, 0, 0, 0.38)',
  },

  action: {
    active: 'rgba(0, 0, 0, 0.54)',
    hover: 'rgba(0, 0, 0, 0.04)',
    selected: 'rgba(0, 0, 0, 0.05)',
    focus: 'rgba(0, 0, 0, 0.12)',
    disabled: 'rgba(0, 0, 0, 0.26)',
    disabledBackground: 'rgba(0, 0, 0, 0.12)',
  },

  primary: {
    main: '#005DBF',
    dark: '#0050A6',
    light: '#308EF2',
    contrastText: '#FFFFFF',
    hover: 'rgba(0, 93, 191, 0.04)',
    selected: 'rgba(0, 93, 191, 0.08)',
    focus: 'rgba(0, 93, 191, 0.12)',
    focusVisible: 'rgba(0, 93, 191, 0.2)',
    outlinedBorder: 'rgba(0, 93, 191, 0.5)',
  },

  secondary: {
    main: '#2E767D',
    dark: '#1C5358',
    light: '#A0DDDF',
    contrastText: '#FFFFFF',
    hover: 'rgba(46, 118, 125, 0.04)',
    selected: 'rgba(46, 118, 125, 0.08)',
    focus: 'rgba(46, 118, 125, 0.12)',
    focusVisible: 'rgba(46, 118, 125, 0.2)',
    outlinedBorder: 'rgba(46, 118, 125, 0.5)',
  },

  error: {
    main: '#A82626',
    dark: '#851C1C',
    light: '#F27070',
    contrastText: '#FFFFFF',
  },

  warning: {
    main: '#FF6F00',
    dark: '#FF6F00',
    light: '#FFC107',
    contrastText: '#FFFFFF',
  },

  info: {
    main: '#0277BD',
    dark: '#01579B',
    light: '#03A9F4',
    contrastText: '#FFFFFF',
  },

  success: {
    main: '#0F5C29',
    dark: '#004718',
    light: '#2AC678',
    contrastText: '#FFFFFF',
  },

  background: {
    default: '#F8F9FA',
    grey: '#F8F9FA',
    paper: '#FFFFFF',
  },

  pastel: {
    blue: '#E9F2FF',
  },

  components: {
    appBar: '#F2F2F2',
    tableBorder: '#BFBFBF',
    avatarFill: '#A6A6A6',
    snackbarFill: '#323232',
    tooltipFill: 'rgba(97, 97, 97, 0.9)',
    backdropFill: 'rgba(0, 0, 0, 0.5)',
  },
} as const

export const figmaColorsDark = {
  divider: 'rgba(255, 255, 255, 0.12)',

  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255, 255, 255, 0.7)',
    disabled: 'rgba(255, 255, 255, 0.38)',
  },

  action: {
    active: '#FFFFFF',
    hover: 'rgba(255, 255, 255, 0.08)',
    selected: 'rgba(255, 255, 255, 0.16)',
    focus: 'rgba(255, 255, 255, 0.12)',
    disabled: 'rgba(255, 255, 255, 0.3)',
    disabledBackground: 'rgba(255, 255, 255, 0.12)',
  },

  primary: {
    main: '#B7DAFF',
    dark: '#308EF2',
    light: '#F5FAFF',
    contrastText: 'rgba(0, 0, 0, 0.87)',
    hover: 'rgba(183, 218, 255, 0.08)',
    selected: 'rgba(183, 218, 255, 0.16)',
    focus: 'rgba(183, 218, 255, 0.12)',
    focusVisible: 'rgba(183, 218, 255, 0.2)',
    outlinedBorder: 'rgba(183, 218, 255, 0.5)',
  },

  secondary: {
    main: '#BCE7E9',
    dark: '#69C3C7',
    light: '#F1FAFA',
    contrastText: 'rgba(0, 0, 0, 0.87)',
    hover: 'rgba(188, 231, 233, 0.08)',
    selected: 'rgba(188, 231, 233, 0.16)',
    focus: 'rgba(188, 231, 233, 0.12)',
    focusVisible: 'rgba(188, 231, 233, 0.2)',
    outlinedBorder: 'rgba(188, 231, 233, 0.5)',
  },

  error: {
    main: '#E03C3C',
    dark: '#A82626',
    light: '#F59494',
    contrastText: '#FFFFFF',
  },

  warning: {
    main: '#FFCA28',
    dark: '#FFA000',
    light: '#FFD54F',
    contrastText: 'rgba(0, 0, 0, 0.87)',
  },

  info: {
    main: '#29B6F6',
    dark: '#0277BD',
    light: '#4FC3F7',
    contrastText: 'rgba(0, 0, 0, 0.87)',
  },

  success: {
    main: '#72E9AD',
    dark: '#007A2B',
    light: '#8FF1B1',
    contrastText: 'rgba(0, 0, 0, 0.87)',
  },

  background: {
    default: '#212121',
    grey: '#212121',
    paper: '#121212',
  },

  pastel: {
    blue: '#0044BC',
  },

  components: {
    appBar: '#272727',
    tableBorder: '#515151',
    avatarFill: '#737373',
    snackbarFill: '#2C2C2C',
    tooltipFill: 'rgba(97, 97, 97, 0.9)',
    backdropFill: 'rgba(0, 0, 0, 0.5)',
  },

  paper: {
    elevation0: '#121212',
    elevation1: '#1E1E1E',
    elevation4: '#272727',
    elevation6: '#2C2C2C',
  },
} as const

/** @deprecated Use figmaColorsLight or getFigmaColors(mode) */
export const figmaColors = figmaColorsLight

export type FigmaColorsLight = typeof figmaColorsLight
export type FigmaColorsDark = typeof figmaColorsDark

export function getFigmaColors(mode: 'light' | 'dark') {
  return mode === 'dark' ? figmaColorsDark : figmaColorsLight
}
