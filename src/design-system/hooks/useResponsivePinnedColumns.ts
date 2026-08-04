import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

export type DataGridPinnedColumns = {
  left?: string[]
  right?: string[]
}

const UNPINNED: DataGridPinnedColumns = { left: [], right: [] }

/**
 * Pin columns only from `md` up. On phones, sticky left/right pins steal tap
 * targets (e.g. status chips) when the grid scrolls horizontally.
 */
export function useResponsivePinnedColumns(pins: DataGridPinnedColumns): DataGridPinnedColumns {
  const theme = useTheme()
  const canPin = useMediaQuery(theme.breakpoints.up('md'), { noSsr: true })
  return canPin ? pins : UNPINNED
}
