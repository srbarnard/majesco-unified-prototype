import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import ViewColumnOutlinedIcon from '@mui/icons-material/ViewColumnOutlined'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import { SearchField, tableActionIconButtonSx } from '@/design-system/components'

type PoliciesListToolbarProps = {
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function PoliciesListToolbar({ searchQuery, onSearchChange }: PoliciesListToolbarProps) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={0.5}>
      <Tooltip title="Manage columns">
        <IconButton size="small" aria-label="Manage columns" sx={tableActionIconButtonSx}>
          <ViewColumnOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Download">
        <IconButton size="small" aria-label="Download policies" sx={tableActionIconButtonSx}>
          <FileDownloadOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <SearchField
        placeholder="Search policies"
        value={searchQuery}
        onSearchChange={onSearchChange}
        sx={{
          width: { xs: '100%', sm: 220, lg: 280 },
        }}
      />
    </Stack>
  )
}
