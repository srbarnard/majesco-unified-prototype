import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import type { Theme } from '@mui/material/styles'
import type { SystemStyleObject } from '@mui/system'
import type { SvgIconComponent } from '@mui/icons-material'
import { Link as RouterLink } from 'react-router'
import { isDarkMode } from '@/design-system/theme/themeSurfaces'
import { getFigmaColors } from '@/design-system/tokens/figma-colors'

/** Distinct tile color per product section — mapped to Figma semantic tokens. */
export type EntityListHomeTone = 'submissions' | 'quotes' | 'policies' | 'insureds' | 'documents'

type SemanticTone = 'primary' | 'secondary' | 'success' | 'warning' | 'info'

const toneSemantic: Record<EntityListHomeTone, SemanticTone> = {
  submissions: 'primary',
  quotes: 'warning',
  policies: 'secondary',
  insureds: 'success',
  documents: 'info',
}

/** Soft fill scales already used by StatusChip / accent surfaces. */
function softScale(theme: Theme, semantic: SemanticTone) {
  const { figmaPalette: palette } = theme
  switch (semantic) {
    case 'primary':
      return palette.blue
    case 'secondary':
      return palette.teal
    case 'success':
      return palette.green
    case 'warning':
      return palette.amber
    case 'info':
      return palette.lightBlue
  }
}

type EntityListHomeButtonBase = {
  /** Tooltip + accessible label, e.g. "All submissions". */
  label: string
  /** Same icon family used in primary nav for that list. */
  icon: SvgIconComponent
  /** Section color for the tile background + icon. */
  tone: EntityListHomeTone
}

export type EntityListHomeButtonProps = EntityListHomeButtonBase &
  ({ to: string; onClick?: never } | { to?: never; onClick: () => void })

function tileSx(theme: Theme, tone: EntityListHomeTone): SystemStyleObject<Theme> {
  const semantic = toneSemantic[tone]
  const tokens = getFigmaColors(theme.palette.mode)[semantic]
  const soft = softScale(theme, semantic)
  const dark = isDarkMode(theme)

  return {
    width: 40,
    height: 40,
    borderRadius: 1.5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    textDecoration: 'none',
    border: 0,
    p: 0,
    cursor: 'pointer',
    bgcolor: dark ? soft[900] : soft[100],
    color: dark ? tokens.light : tokens.dark,
    transition: 'background-color 0.15s ease, color 0.15s ease',
    '&:hover': {
      bgcolor: dark ? soft[800] : soft[200],
    },
    '&:focus-visible': {
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: 2,
    },
  }
}

/**
 * Google Docs–style “return to list” control for entity detail headers.
 * Colored tile + entity icon — not a back arrow.
 */
export function EntityListHomeButton({ to, onClick, label, icon: Icon, tone }: EntityListHomeButtonProps) {
  const sx = (theme: Theme) => tileSx(theme, tone)

  return (
    <Tooltip title={label}>
      {to ? (
        <Box component={RouterLink} to={to} aria-label={label} sx={sx}>
          <Icon sx={{ fontSize: 22 }} />
        </Box>
      ) : (
        <Box component="button" type="button" onClick={onClick} aria-label={label} sx={sx}>
          <Icon sx={{ fontSize: 22 }} />
        </Box>
      )}
    </Tooltip>
  )
}
