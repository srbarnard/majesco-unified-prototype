/**
 * Majesco Figma spacing tokens (Mode 1).
 * Base unit: token `1` = 8px — maps to MUI `theme.spacing(1)`.
 * Keys match Figma scale names (comma decimals normalized to dots).
 */

export const figmaSpacingUnit = 8

/** Figma spacing scale — key → px value. */
export const figmaSpacing = {
  0.5: 4,
  1: 8,
  1.5: 12,
  2: 16,
  3: 24,
  4: 32,
  5: 40,
  6: 48,
  7: 56,
  8: 64,
  9: 72,
  10: 80,
  11: 88,
  12: 96,
} as const

export type FigmaSpacingKey = keyof typeof figmaSpacing

/** Resolve a Figma spacing token to its px value. */
export function getFigmaSpacing(key: FigmaSpacingKey): number {
  return figmaSpacing[key]
}

/**
 * MUI spacing multiplier for a Figma token.
 * e.g. `theme.spacing(figmaSpacingMultiplier[3])` → 24px
 */
export const figmaSpacingMultiplier = figmaSpacing
