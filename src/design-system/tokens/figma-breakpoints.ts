/**
 * Majesco Figma breakpoint tokens (Mode 1).
 * Min-width values in px — align with MUI `theme.breakpoints`.
 */
export const figmaBreakpoints = {
  xs: 444,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
} as const

export type FigmaBreakpoint = keyof typeof figmaBreakpoints

export function getFigmaBreakpoint(key: FigmaBreakpoint): number {
  return figmaBreakpoints[key]
}

/** MUI-compatible breakpoint values from Figma tokens. */
export const muiBreakpointValues = figmaBreakpoints
