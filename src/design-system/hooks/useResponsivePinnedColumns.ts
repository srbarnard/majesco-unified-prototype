import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { useMemo } from 'react'

export type DataGridPinnedColumns = {
  left?: string[]
  right?: string[]
}

const UNPINNED: DataGridPinnedColumns = { left: [], right: [] }

export type ResponsivePinnedColumns = {
  /** Controlled pin model — empty below the desktop layout breakpoint. */
  pinnedColumns: DataGridPinnedColumns
  /** Prevents pin actions from re-applying pins on narrow viewports. */
  disableColumnPinning: boolean
}

/**
 * Pin columns only from `lg` up (desktop layout). On phones/tablets, sticky
 * left/right pin regions make horizontal scrolling hard and steal tap targets.
 */
export function useResponsivePinnedColumns(pins: DataGridPinnedColumns): ResponsivePinnedColumns {
  const theme = useTheme()
  // Match app desktop chrome (`useIsDesktopLayout`) so phones + tablets unpin.
  const canPin = useMediaQuery(theme.breakpoints.up('lg'), { noSsr: true })

  const leftKey = (pins.left ?? []).join('\0')
  const rightKey = (pins.right ?? []).join('\0')

  const pinnedColumns = useMemo<DataGridPinnedColumns>(() => {
    if (!canPin) return UNPINNED
    return {
      left: leftKey ? leftKey.split('\0') : [],
      right: rightKey ? rightKey.split('\0') : [],
    }
  }, [canPin, leftKey, rightKey])

  return {
    pinnedColumns,
    disableColumnPinning: !canPin,
  }
}
