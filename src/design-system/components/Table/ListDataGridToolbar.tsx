import type { GridApi } from '@mui/x-data-grid-premium'
import type { MutableRefObject } from 'react'
import { ExpandableSearchField } from '../SearchField'
import { ListDataGridToolbarActions } from './ListDataGridToolbarActions'

type ListDataGridToolbarProps = {
  apiRef: MutableRefObject<GridApi>
  exportFileName: string
  searchQuery: string
  onSearchChange: (query: string) => void
  searchPlaceholder: string
  exportAriaLabel?: string
}

export function ListDataGridToolbar({
  apiRef,
  exportFileName,
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  exportAriaLabel,
}: ListDataGridToolbarProps) {
  return (
    <ExpandableSearchField
      placeholder={searchPlaceholder}
      value={searchQuery}
      onSearchChange={onSearchChange}
      desktopWidth={{ sm: 220, lg: 280 }}
      endContent={
        <ListDataGridToolbarActions
          apiRef={apiRef}
          exportFileName={exportFileName}
          exportAriaLabel={exportAriaLabel}
        />
      }
    />
  )
}
