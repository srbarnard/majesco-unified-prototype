import type { SxProps, Theme } from '@mui/material/styles'
import { getFigmaColors } from '@/design-system/tokens/figma-colors'

export function isDarkMode(theme: Theme) {
  return theme.palette.mode === 'dark'
}

/** Subtle inset surfaces: table headers, cards on page background. */
export function surfaceMuted(theme: Theme) {
  return isDarkMode(theme) ? theme.figmaDark.paper.elevation1 : theme.figmaPalette.grey[50]
}

/** Secondary panels, hover wells, icon button backgrounds. */
export function surfaceSubtle(theme: Theme) {
  return isDarkMode(theme) ? theme.figmaDark.paper.elevation4 : theme.figmaPalette.grey[100]
}

/** Panel chrome headers/footers, secondary nav. */
export function surfacePanel(theme: Theme) {
  return isDarkMode(theme) ? theme.figmaDark.paper.elevation4 : theme.figmaPalette.grey[100]
}

/** App shell background behind main content. */
export function surfaceApp(theme: Theme) {
  return getFigmaColors(theme.palette.mode).background.grey
}

/** Primary-tinted selection / active nav / chip backgrounds. */
export function accentSubtle(theme: Theme) {
  return isDarkMode(theme) ? theme.figmaPalette.blue[900] : theme.figmaPalette.blue[50]
}

export function accentSubtleHover(theme: Theme) {
  return isDarkMode(theme) ? theme.figmaPalette.blue[800] : theme.figmaPalette.blue[100]
}

/** Shared styles for filter/copilot panel toggle buttons in page headers. */
export function getPanelToggleButtonStyles(theme: Theme, active: boolean) {
  return {
    textTransform: 'none' as const,
    fontWeight: 400,
    fontSize: '0.8125rem',
    minWidth: 'auto',
    px: { xs: 1, sm: 1.25 },
    py: 0.75,
    border: 'none',
    borderRadius: '30px',
    boxShadow: 'none',
    color: active ? theme.palette.primary.main : theme.palette.text.secondary,
    bgcolor: active ? accentSubtle(theme) : 'transparent',
    '&:hover': {
      bgcolor: active ? accentSubtleHover(theme) : surfaceSubtle(theme),
      boxShadow: 'none',
    },
  }
}

export function panelToggleButtonSx(active: boolean): SxProps<Theme> {
  return (theme) => getPanelToggleButtonStyles(theme, active)
}

/** Link cell hover in tables. */
export function accentLinkHover(theme: Theme) {
  return accentSubtle(theme)
}

export function dataGridPinnedShadow(theme: Theme, side: 'left' | 'right' = 'left') {
  const offset = side === 'left' ? '4px 0 8px -4px' : '-4px 0 8px -4px'
  return isDarkMode(theme) ? `${offset} rgba(0, 0, 0, 0.55)` : `${offset} rgba(0, 0, 0, 0.08)`
}

export function chartAxisFill(theme: Theme) {
  return isDarkMode(theme) ? theme.figmaPalette.grey[400] : theme.figmaPalette.grey[600]
}

export function chartGridStroke(theme: Theme) {
  return isDarkMode(theme) ? theme.figmaPalette.grey[700] : theme.figmaPalette.grey[200]
}

const dataGridShellBaseSx = {
  flex: 1,
  minHeight: 0,
  height: '100%',
  width: '100%',
  border: 'none',
  borderRadius: 0,
  bgcolor: 'background.paper',
  '& .MuiDataGrid-columnHeaders': {
    bgcolor: (theme: Theme) => surfaceMuted(theme),
    borderBottom: 1,
    borderColor: 'divider',
  },
  '& .MuiDataGrid-columnHeaderTitle': {
    fontWeight: 600,
    fontSize: '0.75rem',
    color: 'text.secondary',
  },
  '& .MuiDataGrid-columnHeader': {
    px: 1.5,
    '&:focus, &:focus-within': { outline: 'none' },
  },
  '& .MuiDataGrid-cell': {
    px: 1.5,
    py: 1,
    display: 'flex',
    alignItems: 'center',
    borderColor: 'divider',
    color: 'text.primary',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    '&:focus, &:focus-within': { outline: 'none' },
  },
  '& .MuiDataGrid-cell--pinnedLeft': {
    bgcolor: 'background.paper',
    boxShadow: (theme: Theme) => dataGridPinnedShadow(theme, 'left'),
  },
  '& .MuiDataGrid-columnHeader--pinnedLeft': {
    bgcolor: (theme: Theme) => surfaceMuted(theme),
    boxShadow: (theme: Theme) => dataGridPinnedShadow(theme, 'left'),
  },
  '& .MuiDataGrid-cell--pinnedRight': {
    bgcolor: 'background.paper',
    boxShadow: (theme: Theme) => dataGridPinnedShadow(theme, 'right'),
  },
  '& .MuiDataGrid-columnHeader--pinnedRight': {
    bgcolor: (theme: Theme) => surfaceMuted(theme),
    boxShadow: (theme: Theme) => dataGridPinnedShadow(theme, 'right'),
  },
  '& .MuiDataGrid-row.Mui-selected': {
    bgcolor: (theme: Theme) => accentSubtle(theme),
    '&:hover': {
      bgcolor: (theme: Theme) => accentSubtleHover(theme),
    },
  },
  '& .MuiDataGrid-filler': {
    bgcolor: (theme: Theme) => surfaceMuted(theme),
  },
} as const

export function dataGridShellSx(extra?: Record<string, unknown>): SxProps<Theme>[] {
  return extra ? [dataGridShellBaseSx, extra] : [dataGridShellBaseSx]
}
