import type { Theme } from '@mui/material/styles'
import type { AppTheme } from '@/design-system/theme'
import { accentSubtleHover, surfaceMuted } from '@/design-system/theme/themeSurfaces'
import { layoutTokens } from '@/design-system/tokens/layout'
import { motionTokens } from '@/design-system/tokens/motion'

const motionSafe = '@media (prefers-reduced-motion: no-preference)'

export function studioCardSx(_theme: Theme) {
  return {
    borderRadius: `${layoutTokens.cardRadius}px`,
    bgcolor: 'background.paper',
    border: 'none',
    boxShadow: 'none',
  }
}

export function studioSelectableCardSx(theme: Theme, selected = false) {
  return {
    ...studioCardSx(theme),
    bgcolor: selected ? accentSubtleHover(theme) : surfaceMuted(theme as AppTheme),
    transition: `background-color 0.18s ease, transform ${motionTokens.durationFastMs}ms ${motionTokens.easing}`,
    cursor: 'pointer',
    boxShadow: 'none',
    '&:hover': {
      bgcolor: accentSubtleHover(theme),
      boxShadow: 'none',
    },
    [motionSafe]: {
      '&:hover': {
        transform: `translateY(${motionTokens.cardHoverTranslateY}px) scale(${motionTokens.cardHoverScale})`,
      },
    },
  }
}

export const studioHeadingSx = {
  fontFamily: 'inherit',
  fontWeight: 600,
} as const

export const studioBodySx = {
  fontFamily: 'inherit',
  fontWeight: 400,
} as const
