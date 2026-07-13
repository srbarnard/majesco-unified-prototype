/**
 * Majesco Figma breakpoint tokens (Mode 1).
 * Min-width values in px — align with MUI `theme.breakpoints`.
 *
 * `xs` must be 0 so MUI mobile-first responsive props apply on narrow phones
 * (e.g. iPhone ~390px). A non-zero xs leaves a gap with no matching styles.
 */
export const figmaBreakpoints = {
  xs: 0,
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
