import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import type { Theme } from '@mui/material/styles'
import type { SystemStyleObject } from '@mui/system'
import type { SvgIconComponent } from '@mui/icons-material'
import { Link as RouterLink } from 'react-router'
import { isDarkMode } from '@/design-system/theme/themeSurfaces'
import { getFigmaColors } from '@/design-system/tokens/figma-colors'

type EntityListHomeButtonBase = {
  /** Tooltip + accessible label, e.g. "All submissions". */
  label: string
  /** Same icon family used in primary nav for that list. */
  icon: SvgIconComponent
}

export type EntityListHomeButtonProps = EntityListHomeButtonBase &
  ({ to: string; onClick?: never } | { to?: never; onClick: () => void })

function tileSx(theme: Theme): SystemStyleObject<Theme> {
  const secondary = getFigmaColors(theme.palette.mode).secondary

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
    bgcolor: isDarkMode(theme) ? theme.figmaPalette.teal[900] : theme.figmaPalette.teal[100],
    color: secondary.main,
    transition: 'background-color 0.15s ease',
    '&:hover': {
      bgcolor: isDarkMode(theme) ? theme.figmaPalette.teal[800] : theme.figmaPalette.teal[200],
    },
    '&:focus-visible': {
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: 2,
    },
  }
}

/**
 * Google Docs–style “return to list” control for entity detail headers.
 * Teal tile + entity icon — not a back arrow.
 */
export function EntityListHomeButton({ to, onClick, label, icon: Icon }: EntityListHomeButtonProps) {
  return (
    <Tooltip title={label}>
      {to ? (
        <Box component={RouterLink} to={to} aria-label={label} sx={tileSx}>
          <Icon sx={{ fontSize: 22 }} />
        </Box>
      ) : (
        <Box component="button" type="button" onClick={onClick} aria-label={label} sx={tileSx}>
          <Icon sx={{ fontSize: 22 }} />
        </Box>
      )}
    </Tooltip>
  )
}
