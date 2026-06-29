/**
 * Majesco Figma border radius tokens (Mode 1).
 */
export const figmaBorderRadius = {
  none: 0,
  borderRadius: 4,
  subtle: 6,
  pillRadius: 6,
} as const

export type FigmaBorderRadiusKey = keyof typeof figmaBorderRadius

export function getFigmaBorderRadius(key: FigmaBorderRadiusKey): number {
  return figmaBorderRadius[key]
}
