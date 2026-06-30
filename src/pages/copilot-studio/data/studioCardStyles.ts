import type { Theme } from '@mui/material/styles'
import type { AppTheme } from '@/design-system/theme'
import { accentSubtleHover, surfaceMuted } from '@/design-system/theme/themeSurfaces'
import { layoutTokens } from '@/design-system/tokens/layout'

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
    transition: 'background-color 0.18s ease, transform 0.18s ease',
    cursor: 'pointer',
    boxShadow: 'none',
    '&:hover': {
      bgcolor: accentSubtleHover(theme),
      boxShadow: 'none',
      transform: 'translateY(-1px)',
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
