/**
 * Majesco design system color tokens.
 * Source: Majesco brand guidelines + Agent360 product palette.
 * Sync with Figma variables when the design token file is linked.
 */
export const colors = {
  brand: {
    blue: '#005DBF',
    blueLight: '#3D87D4',
    blueDark: '#004A99',
    teal: '#2E767D',
    tealDark: '#245E64',
    green: '#90C06A',
    greenDark: '#67933E',
  },
  action: {
    primary: '#005DBF',
    primaryHover: '#004A99',
    link: '#005DBF',
    linkHover: '#004A99',
  },
  neutral: {
    0: '#FFFFFF',
    50: '#F4F6F8',
    100: '#E8ECF0',
    200: '#D1D9E0',
    300: '#A8B4BE',
    400: '#888B8D',
    500: '#7F7F7F',
    600: '#5C6670',
    700: '#303030',
    800: '#212529',
    900: '#080808',
    950: '#161720',
  },
  semantic: {
    success: '#67933E',
    successLight: '#90C06A',
    warning: '#E8A317',
    error: '#D32F2F',
    info: '#005DBF',
  },
  text: {
    primary: '#080808',
    secondary: '#5C6670',
    disabled: '#999999',
    inverse: '#FFFFFF',
  },
  border: {
    default: '#E8ECF0',
    strong: '#D1D9E0',
    focus: '#005DBF',
  },
  surface: {
    default: '#F4F6F8',
    paper: '#FFFFFF',
    sidebar: '#FFFFFF',
    header: '#FFFFFF',
    selected: 'rgba(0, 93, 191, 0.08)',
    hover: 'rgba(0, 93, 191, 0.04)',
  },
} as const

export const darkColors = {
  brand: colors.brand,
  action: {
    primary: '#4D9AFF',
    primaryHover: '#7AB4FF',
    link: '#6EC6FF',
    linkHover: '#9AD8FF',
  },
  neutral: {
    0: '#0F1419',
    50: '#151C24',
    100: '#1A2027',
    200: '#243040',
    300: '#3A4A5C',
    400: '#5C6B7A',
    500: '#8A97A5',
    600: '#A8B4BE',
    700: '#C5CDD4',
    800: '#E2E7EB',
    900: '#F4F6F8',
    950: '#FFFFFF',
  },
  semantic: {
    success: '#90C06A',
    successLight: '#B5D99A',
    warning: '#F0B429',
    error: '#F44336',
    info: '#6EC6FF',
  },
  text: {
    primary: '#F4F6F8',
    secondary: '#A8B4BE',
    disabled: '#5C6B7A',
    inverse: '#080808',
  },
  border: {
    default: '#243040',
    strong: '#3A4A5C',
    focus: '#4D9AFF',
  },
  surface: {
    default: '#0F1419',
    paper: '#1A2027',
    sidebar: '#151C24',
    header: '#1A2027',
    selected: 'rgba(77, 154, 255, 0.16)',
    hover: 'rgba(77, 154, 255, 0.08)',
  },
} as const
