import Stack from '@mui/material/Stack'
import type { GridApi } from '@mui/x-data-grid-premium'
import type { MutableRefObject } from 'react'
import { SearchField } from '../SearchField'
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
    <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={0.5}>
      <ListDataGridToolbarActions
        apiRef={apiRef}
        exportFileName={exportFileName}
        exportAriaLabel={exportAriaLabel}
      />
      <SearchField
        placeholder={searchPlaceholder}
        value={searchQuery}
        onSearchChange={onSearchChange}
        sx={{
          width: { xs: '100%', sm: 220, lg: 280 },
        }}
      />
    </Stack>
  )
}
