import AddIcon from '@mui/icons-material/Add'
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { Button, SearchField } from '@/design-system/components'
import { documentAttachMenuItems, type DocumentAttachTarget } from '@/pages/policies/components/DocumentAttachComposer'

type DocumentsActionBarProps = {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedCount: number
  filterCount?: number
  visibleCount?: number
  totalCount?: number
  onRemoveSelected?: () => void
  onAttachTo?: (target: DocumentAttachTarget) => void
}

export function DocumentsActionBar({
  searchQuery,
  onSearchChange,
  selectedCount,
  filterCount = 0,
  visibleCount,
  totalCount,
  onRemoveSelected,
  onAttachTo,
}: DocumentsActionBarProps) {
  const disableBulkActions = selectedCount === 0
  const [attachMenuAnchor, setAttachMenuAnchor] = useState<null | HTMLElement>(null)

  const handleAttachSelect = (target: DocumentAttachTarget) => {
    setAttachMenuAnchor(null)
    onAttachTo?.(target)
  }

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
            disabled={disableBulkActions}
            onClick={(event) => setAttachMenuAnchor(event.currentTarget)}
            sx={{ color: disableBulkActions ? 'text.disabled' : 'text.primary', textTransform: 'none' }}
          >
            Attach To
          </Button>
          <Menu
            anchorEl={attachMenuAnchor}
            open={Boolean(attachMenuAnchor)}
            onClose={() => setAttachMenuAnchor(null)}
          >
            {documentAttachMenuItems.map((item) => (
              <MenuItem key={item.target} onClick={() => handleAttachSelect(item.target)}>
                {item.label}
              </MenuItem>
            ))}
          </Menu>
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
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
        {filterCount > 0 ? `${filterCount} filter${filterCount === 1 ? '' : 's'}` : '0 filters'}
        {typeof visibleCount === 'number' && typeof totalCount === 'number'
          ? ` · ${visibleCount} of ${totalCount} document${totalCount === 1 ? '' : 's'}`
          : ''}
        {selectedCount > 0 ? ` · ${selectedCount} selected` : ''}
      </Typography>
    </Box>
  )
}
