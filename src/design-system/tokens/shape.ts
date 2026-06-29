/**
 * Majesco shape and border tokens.
 * Spacing: see `figma-spacing.ts`. Border radius: see `figma-border-radius.ts`.
 */
import { figmaBorderRadius } from './figma-border-radius'
import { figmaSpacingUnit } from './figma-spacing'

/** Border radius scale aligned with Figma tokens. */
export const borderRadius = {
  none: figmaBorderRadius.none,
  default: figmaBorderRadius.borderRadius,
  subtle: figmaBorderRadius.subtle,
  pill: figmaBorderRadius.pillRadius,
} as const

export const borderWidth = {
  thin: 1,
  medium: 2,
  thick: 4,
} as const

export const spacingUnit = figmaSpacingUnit
