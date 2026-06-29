import AddIcon from '@mui/icons-material/Add'
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Button, SearchField } from '@/design-system/components'

type DocumentsActionBarProps = {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedCount: number
  filterCount?: number
  onRemoveSelected?: () => void
}

export function DocumentsActionBar({
  searchQuery,
  onSearchChange,
  selectedCount,
  filterCount = 0,
  onRemoveSelected,
}: DocumentsActionBarProps) {
  const disableBulkActions = selectedCount === 0

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={1}
        alignItems={{ xs: 'stretch', lg: 'center' }}
        justifyContent="space-between"
      >
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap alignItems="center">
          <Button
            size="small"
            color="primary"
            startIcon={<AddIcon />}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Add Document
          </Button>
          <Button
            size="small"
            color="inherit"
            startIcon={<AttachFileOutlinedIcon />}
            endIcon={<KeyboardArrowDownIcon />}
            sx={{ color: 'text.primary', textTransform: 'none' }}
          >
            Attach To
          </Button>
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, display: { xs: 'none', sm: 'block' } }} />
          <Button
            size="small"
            color="inherit"
            startIcon={<FileDownloadOutlinedIcon />}
            disabled={disableBulkActions}
            sx={{ color: disableBulkActions ? 'text.disabled' : 'text.primary', textTransform: 'none' }}
          >
            Export
          </Button>
          <Button
            size="small"
            color="inherit"
            startIcon={<DeleteOutlineIcon />}
            disabled={disableBulkActions}
            onClick={onRemoveSelected}
            sx={{ color: disableBulkActions ? 'text.disabled' : 'text.primary', textTransform: 'none' }}
          >
            Remove
          </Button>
        </Stack>
        <SearchField
          placeholder="Search documents"
          value={searchQuery}
          onSearchChange={onSearchChange}
          enableVoice
          sx={{
            width: { xs: '100%', lg: 280 },
          }}
        />
      </Stack>
      {(selectedCount > 0 || filterCount > 0) && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {filterCount > 0 ? `Filter ${filterCount} filters` : ''}
          {selectedCount > 0 ? `${filterCount > 0 ? ' · ' : ''}${selectedCount} selected` : ''}
        </Typography>
      )}
    </Box>
  )
}
