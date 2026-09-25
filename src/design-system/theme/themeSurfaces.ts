import type { SxProps, Theme } from '@mui/material/styles'
import {
  listDataGridShellHeightSx,
  type ListDataGridHeightOptions,
} from '@/design-system/tokens/tableLayout'
import { layoutTokens } from '@/design-system/tokens/layout'
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
  if (isDarkMode(theme)) {
    return getFigmaColors('dark').primary.selected
  }
  return theme.figmaPalette.blue[50]
}

export function accentSubtleHover(theme: Theme) {
  if (isDarkMode(theme)) {
    return getFigmaColors('dark').primary.focusVisible
  }
  return theme.figmaPalette.blue[100]
}

/** Incoming note/chat bubble — Majesco secondary (teal) wash. */
export function chatBubbleIncoming(theme: Theme) {
  return isDarkMode(theme)
    ? getFigmaColors('dark').secondary.selected
    : theme.figmaPalette.teal[50]
}

/** Outgoing note/chat bubble — Majesco primary (blue) wash. */
export function chatBubbleOutgoing(theme: Theme) {
  return isDarkMode(theme) ? theme.figmaPalette.blue[800] : theme.figmaPalette.blue[100]
}

/** Current-user initials avatar — matches global navbar (teal fill, white text). */
export function chatAuthorAvatarSx(theme: Theme) {
  return {
    width: 24,
    height: 24,
    fontSize: '0.625rem',
    fontWeight: 600,
    bgcolor: theme.figmaPalette.teal[600],
    color: theme.palette.common.white,
  } as const
}

/** Peer / other-author initials — stable color from design system keyed to user id. */
export function chatPeerAuthorAvatarSx(theme: Theme, userKey = '') {
  const dark = isDarkMode(theme)
  const swatches = dark
    ? [
        theme.figmaPalette.blue[400],
        theme.figmaPalette.teal[400],
        theme.figmaPalette.amber[400],
        theme.figmaPalette.lightBlue[400],
        theme.figmaPalette.green[400],
        theme.figmaPalette.red[300],
        theme.figmaPalette.grey[500],
      ]
    : [
        theme.figmaPalette.blue[600],
        theme.figmaPalette.teal[700],
        theme.figmaPalette.amber[800],
        theme.figmaPalette.lightBlue[700],
        theme.figmaPalette.green[700],
        theme.figmaPalette.red[600],
        theme.figmaPalette.grey[600],
      ]

  let hash = 0
  const key = userKey.trim() || 'peer'
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0
  }
  const bgcolor = swatches[hash % swatches.length]

  return {
    width: 24,
    height: 24,
    fontSize: '0.625rem',
    fontWeight: 600,
    bgcolor,
    color: theme.palette.common.white,
  } as const
}

/** Peer message bubble — neutral wash (not the You teal plate). */
export function chatPeerBubble(theme: Theme) {
  return isDarkMode(theme) ? theme.figmaPalette.grey[800] : theme.figmaPalette.grey[100]
}

/** Light-blue insight / callout surfaces — no chrome border or shadow. */
export function accentSurfaceCardSx(theme: Theme) {
  return {
    borderRadius: `${layoutTokens.cardRadius}px`,
    bgcolor: accentSubtle(theme),
    border: 'none',
    boxShadow: 'none',
  }
}

/** Shared styles for filter/copilot panel toggle buttons in page headers.
 * Matches Pulse pill active/inactive: solid primary when on, muted surface when off.
 */
export function getPanelToggleButtonStyles(theme: Theme, active: boolean) {
  return {
    textTransform: 'none' as const,
    fontWeight: active ? 600 : 500,
    fontSize: '0.8125rem',
    minWidth: 'auto',
    px: { xs: 1, sm: 1.25 },
    py: 0.75,
    border: 'none',
    borderRadius: '30px',
    boxShadow: 'none',
    color: active ? theme.palette.primary.contrastText : theme.palette.text.secondary,
    bgcolor: active ? theme.palette.primary.main : surfaceMuted(theme),
    '&:hover': {
      bgcolor: active ? theme.palette.primary.dark : surfaceSubtle(theme),
      boxShadow: 'none',
    },
    '& .MuiButton-startIcon': {
      opacity: 1,
      color: 'inherit',
    },
  }
}

export function panelToggleButtonSx(active: boolean): SxProps<Theme> {
  return (theme) => getPanelToggleButtonStyles(theme, active)
}

/** Full-width divider under section tab rows (Policies, Quotes, Tasks, Policy detail). */
export const sectionTabRowBorderSx: SxProps<Theme> = {
  borderBottom: 1,
  borderColor: 'divider',
  width: '100%',
}

/** Link cell hover in tables. */
export function accentLinkHover(theme: Theme) {
  return accentSubtle(theme)
}

export function dataGridPinnedShadow(theme: Theme, side: 'left' | 'right' = 'left') {
  const offset = side === 'left' ? '4px 0 8px -4px' : '-4px 0 8px -4px'
  return isDarkMode(theme) ? `${offset} rgba(0, 0, 0, 0.55)` : `${offset} rgba(0, 0, 0, 0.08)`
}

/** Opaque paper fill for pinned body cells — masks horizontal scroll bleed. */
export function dataGridPinnedBodyCellBackground(theme: Theme) {
  return theme.palette.background.paper
}

function dataGridPinnedBodyCellImportantSx(theme: Theme) {
  const paper = dataGridPinnedBodyCellBackground(theme)
  return {
    bgcolor: `${paper} !important`,
    backgroundColor: `${paper} !important`,
    background: `${paper} !important`,
  } as const
}

/** Overrides MUI default grey pinned background + blended row hover on pinned cells. */
export function dataGridPinnedBodyCellSx(theme: Theme) {
  const pinned = dataGridPinnedBodyCellImportantSx(theme)
  const paper = dataGridPinnedBodyCellBackground(theme)
  return {
    '--DataGrid-pinnedBackground': paper,
    '& .MuiDataGrid-cell--pinnedLeft, & .MuiDataGrid-cell--pinnedRight': pinned,
    '& .MuiDataGrid-virtualScrollerContent .MuiDataGrid-row:hover:not(.Mui-selected):not(.task-row-active) .MuiDataGrid-cell--pinnedLeft, & .MuiDataGrid-virtualScrollerContent .MuiDataGrid-row:hover:not(.Mui-selected):not(.task-row-active) .MuiDataGrid-cell--pinnedRight':
      pinned,
    '& .MuiDataGrid-virtualScrollerContent .MuiDataGrid-row.Mui-hovered:not(.Mui-selected):not(.task-row-active) .MuiDataGrid-cell--pinnedLeft, & .MuiDataGrid-virtualScrollerContent .MuiDataGrid-row.Mui-hovered:not(.Mui-selected):not(.task-row-active) .MuiDataGrid-cell--pinnedRight':
      pinned,
  }
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
    bgcolor: (theme: Theme) => `${dataGridPinnedBodyCellBackground(theme)} !important`,
    boxShadow: (theme: Theme) => dataGridPinnedShadow(theme, 'left'),
  },
  '& .MuiDataGrid-cell--pinnedRight': {
    bgcolor: (theme: Theme) => `${dataGridPinnedBodyCellBackground(theme)} !important`,
    boxShadow: (theme: Theme) => dataGridPinnedShadow(theme, 'right'),
  },
  '& .MuiDataGrid-columnHeader--pinnedLeft': {
    bgcolor: (theme: Theme) => surfaceMuted(theme),
    boxShadow: (theme: Theme) => dataGridPinnedShadow(theme, 'left'),
  },
  '& .MuiDataGrid-columnHeader--pinnedRight': {
    bgcolor: (theme: Theme) => surfaceMuted(theme),
    boxShadow: (theme: Theme) => dataGridPinnedShadow(theme, 'right'),
  },
  '& .MuiDataGrid-row.Mui-selected': {
    bgcolor: (theme: Theme) => `${accentSubtle(theme)} !important`,
    '&:hover': {
      bgcolor: (theme: Theme) => `${accentSubtleHover(theme)} !important`,
    },
  },
  '& .MuiDataGrid-row.Mui-selected .MuiDataGrid-cell--pinnedLeft, & .MuiDataGrid-row.Mui-selected .MuiDataGrid-cell--pinnedRight': {
    bgcolor: (theme: Theme) => `${accentSubtle(theme)} !important`,
  },
  '& .MuiDataGrid-row.Mui-selected:hover .MuiDataGrid-cell--pinnedLeft, & .MuiDataGrid-row.Mui-selected:hover .MuiDataGrid-cell--pinnedRight': {
    bgcolor: (theme: Theme) => `${accentSubtleHover(theme)} !important`,
  },
  '& .MuiDataGrid-filler': {
    bgcolor: (theme: Theme) => surfaceMuted(theme),
  },
  '& .MuiDataGrid-headerFilterRow': {
    bgcolor: (theme: Theme) => surfaceMuted(theme),
    minHeight: 'unset !important',
  },
  '& .MuiDataGrid-headerFilterRow .MuiDataGrid-columnHeader': {
    px: 1.25,
    py: 0.5,
    minHeight: 'unset !important',
    alignItems: 'flex-end',
  },
  '& .MuiDataGrid-headerFilterRow .MuiFormControl-root': {
    width: '100%',
    my: 0,
    pt: 0.5,
  },
  '& .MuiDataGrid-headerFilterRow .MuiInputBase-root': {
    fontSize: '0.75rem',
    lineHeight: 1.3,
    mt: 0,
    mb: 0,
    color: 'text.secondary',
    outline: 'none',
    boxShadow: 'none',
    '&.Mui-focused': {
      outline: 'none',
      boxShadow: 'none',
    },
  },
  '& .MuiDataGrid-headerFilterRow .MuiOutlinedInput-root': {
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
    '&.Mui-focused': {
      outline: 'none',
      boxShadow: 'none',
    },
  },
  '& .MuiDataGrid-headerFilterRow .MuiInputLabel-root, & .MuiDataGrid-headerFilterRow .MuiFormLabel-root': {
    fontSize: '0.8125rem',
    lineHeight: 1.3,
    letterSpacing: 0,
    color: 'text.disabled',
    transform: 'translate(2px, 12px) scale(1)',
  },
  '& .MuiDataGrid-headerFilterRow .MuiInputLabel-root.Mui-focused': {
    color: 'text.secondary',
  },
  '& .MuiDataGrid-headerFilterRow .MuiInputLabel-root.MuiInputLabel-shrink': {
    transform: 'translate(2px, -5px) scale(1)',
    fontSize: '0.75rem',
    fontWeight: 500,
    color: 'text.secondary',
  },
  '& .MuiDataGrid-headerFilterRow .MuiInputBase-input': {
    py: 0.375,
    px: 0.5,
    height: 22,
    minHeight: 22,
  },
  '& .MuiDataGrid-headerFilterRow .MuiInputBase-input::placeholder': {
    fontSize: '0.75rem',
    opacity: 0.55,
  },
  '& .MuiDataGrid-headerFilterRow input[type="date"], & .MuiDataGrid-headerFilterRow input[type="datetime-local"]': {
    fontSize: '0.75rem',
  },
  '& .MuiDataGrid-headerFilterRow .MuiInput-underline:before': {
    borderBottomColor: 'divider',
  },
  '& .MuiDataGrid-headerFilterRow .MuiInput-underline:hover:not(.Mui-disabled):before': {
    borderBottomColor: 'action.hover',
  },
  '& .MuiDataGrid-headerFilterRow .MuiInput-underline:after': {
    borderBottomWidth: 2,
  },
  '& .MuiDataGrid-headerFilterRow .MuiInputBase-root.Mui-focused .MuiInput-underline:after': {
    borderBottomColor: 'primary.main',
  },
  '& .MuiDataGrid-headerFilterRow .MuiIconButton-root': {
    p: 0.375,
    color: 'text.disabled',
    '& .MuiSvgIcon-root': {
      fontSize: '0.875rem',
    },
  },
} as const

export function dataGridShellSx(
  extra?: Record<string, unknown>,
  heightOptions?: ListDataGridHeightOptions,
): SxProps<Theme>[] {
  const shell = {
    ...dataGridShellBaseSx,
    ...listDataGridShellHeightSx(heightOptions ?? { headerFilters: true }),
  }
  return extra ? [shell, extra] : [shell]
}
