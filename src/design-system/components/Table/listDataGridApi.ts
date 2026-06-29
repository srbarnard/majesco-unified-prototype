import { GridPreferencePanelsValue } from '@mui/x-data-grid/hooks/features/preferencesPanel/gridPreferencePanelsValue'
import type { GridApi, GridColDef } from '@mui/x-data-grid-premium'
import type { MutableRefObject } from 'react'

export function openListDataGridColumnsPanel(apiRef: MutableRefObject<GridApi>) {
  apiRef.current?.showPreferences(GridPreferencePanelsValue.columns)
}

export function exportListDataGridCsv(apiRef: MutableRefObject<GridApi>, fileName: string) {
  apiRef.current?.exportDataAsCsv({
    fileName,
    utf8WithBom: true,
  })
}

export function getListDataGridTogglableColumns(columns: GridColDef[]) {
  return columns
    .filter((column) => column.field !== 'actions' && column.field !== '__check__')
    .map((column) => column.field)
}

export const listDataGridFilterProps = {
  filterMode: 'client' as const,
  headerFilters: true,
  headerFilterHeight: 44,
}

export function getListDataGridSlotProps() {
  return {
    columnsManagement: {
      getTogglableColumns: getListDataGridTogglableColumns,
    },
    headerFilterCell: {
      InputComponentProps: {
        variant: 'standard',
        InputLabelProps: {
          sx: {
            fontSize: '0.8125rem',
            lineHeight: 1.3,
            transform: 'translate(2px, 12px) scale(1)',
            '&.Mui-focused': {
              color: 'text.secondary',
            },
            '&.MuiInputLabel-shrink': {
              transform: 'translate(2px, -5px) scale(1)',
              fontSize: '0.75rem',
              fontWeight: 500,
              color: 'text.secondary',
            },
          },
        },
        sx: {
          '&.MuiInputBase-root.Mui-focused': {
            outline: 'none',
            boxShadow: 'none',
          },
        },
        inputProps: {
          style: {
            fontSize: '0.75rem',
          },
        },
      },
    },
  }
}

export const listDataGridActionColumnProps = {
  hideable: false,
  disableExport: true,
  filterable: false,
  disableColumnMenu: true,
} as const
