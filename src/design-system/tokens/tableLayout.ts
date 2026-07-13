import type { SxProps, Theme } from '@mui/material/styles'

/** Shared dimensions for internally scrolling list tables and data grids. */
export const tableLayoutTokens = {
  dataGridColumnHeaderHeight: 40,
  dataGridHeaderFilterHeight: 44,
  /** Baseline row height used for min-height calculations (auto-height rows may grow taller). */
  dataGridDefaultRowHeight: 56,
  dataGridMinVisibleRows: 7,
  dataGridFooterHeight: 52,
  /** Viewport offset for laptop-sized screens (app chrome + page header + toolbar). */
  dataGridViewportOffsetSm: '20rem',
  dataGridViewportOffsetMd: '16rem',
} as const

export type ListDataGridHeightOptions = {
  headerFilters?: boolean
  footer?: boolean
  minVisibleRows?: number
}

export function listDataGridMinHeight(options: ListDataGridHeightOptions = {}) {
  const {
    headerFilters = true,
    footer = false,
    minVisibleRows = tableLayoutTokens.dataGridMinVisibleRows,
  } = options

  const {
    dataGridColumnHeaderHeight,
    dataGridHeaderFilterHeight,
    dataGridDefaultRowHeight,
    dataGridFooterHeight,
  } = tableLayoutTokens

  return (
    dataGridColumnHeaderHeight +
    (headerFilters ? dataGridHeaderFilterHeight : 0) +
    minVisibleRows * dataGridDefaultRowHeight +
    (footer ? dataGridFooterHeight : 0)
  )
}

/** Responsive max-height: capped on laptops, full flex height on large monitors. */
export function listDataGridMaxHeight(options: ListDataGridHeightOptions = {}) {
  const minHeightPx = listDataGridMinHeight(options)
  const { dataGridViewportOffsetSm, dataGridViewportOffsetMd } = tableLayoutTokens

  return {
    xs: `clamp(${minHeightPx}px, calc(100vh - ${dataGridViewportOffsetSm}), 100%)`,
    md: `clamp(${minHeightPx}px, calc(100vh - ${dataGridViewportOffsetMd}), 100%)`,
    xl: '100%',
  } as const
}

export function listDataGridShellHeightSx(options: ListDataGridHeightOptions = {}): SxProps<Theme> {
  return {
    minHeight: listDataGridMinHeight(options),
    maxHeight: listDataGridMaxHeight(options),
  }
}

export function listDataGridContainerSx(options: ListDataGridHeightOptions = {}): SxProps<Theme> {
  return {
    flex: 1,
    minHeight: listDataGridMinHeight(options),
    minWidth: 0,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  }
}

/** Allow list pages to scroll when the grid enforces a taller minimum on smaller screens. */
export function listPageContentOverflowSx(isScrollableListTab: boolean): SxProps<Theme> {
  if (!isScrollableListTab) {
    return { overflow: 'auto' }
  }

  return {
    overflow: { xs: 'auto', xl: 'hidden' },
  }
}
