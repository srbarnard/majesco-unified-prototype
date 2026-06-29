import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import ViewColumnOutlinedIcon from '@mui/icons-material/ViewColumnOutlined'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import type { GridApi } from '@mui/x-data-grid-premium'
import type { MutableRefObject } from 'react'
import { tableActionIconButtonSx } from './DataTable'
import { exportListDataGridCsv, openListDataGridColumnsPanel } from './listDataGridApi'

type ListDataGridToolbarActionsProps = {
  apiRef: MutableRefObject<GridApi>
  exportFileName: string
  exportAriaLabel?: string
}

export function ListDataGridToolbarActions({
  apiRef,
  exportFileName,
  exportAriaLabel,
}: ListDataGridToolbarActionsProps) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.5}>
      <Tooltip title="Manage columns">
        <IconButton
          size="small"
          aria-label="Manage columns"
          sx={tableActionIconButtonSx}
          onClick={() => openListDataGridColumnsPanel(apiRef)}
        >
          <ViewColumnOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Download">
        <IconButton
          size="small"
          aria-label={exportAriaLabel ?? `Download ${exportFileName}`}
          sx={tableActionIconButtonSx}
          onClick={() => exportListDataGridCsv(apiRef, exportFileName)}
        >
          <FileDownloadOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  )
}
