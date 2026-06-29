import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import Stack from '@mui/material/Stack'
import type { SxProps, Theme } from '@mui/material/styles'
import type { GridApi } from '@mui/x-data-grid-premium'
import type { MutableRefObject } from 'react'
import { Button, ListDataGridToolbarActions, SearchField } from '@/design-system/components'
import { surfaceSubtle } from '@/design-system/theme/themeSurfaces'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'

function bulkActionButtonSx(enabled: boolean): SxProps<Theme> {
  return (theme) => ({
    textTransform: 'none',
    fontFamily: figmaFontFamilyStack.body,
    fontSize: '0.875rem',
    fontWeight: 400,
    border: 'none',
    boxShadow: 'none',
    minWidth: 'auto',
    px: 1,
    color: enabled ? 'text.secondary' : 'text.disabled',
    '& .MuiButton-startIcon': {
      color: 'inherit',
    },
    '&:hover': {
      border: 'none',
      boxShadow: 'none',
      bgcolor: enabled ? surfaceSubtle(theme) : 'transparent',
      color: enabled ? 'text.primary' : 'text.disabled',
    },
    '&.Mui-disabled': {
      border: 'none',
      boxShadow: 'none',
      color: 'text.disabled',
    },
  })
}

type TasksActionBarProps = {
  apiRef: MutableRefObject<GridApi>
  searchQuery: string
  onSearchChange: (query: string) => void
  hasSelection: boolean
}

export function TasksActionBar({ apiRef, searchQuery, onSearchChange, hasSelection }: TasksActionBarProps) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      alignItems={{ xs: 'stretch', md: 'center' }}
      justifyContent="space-between"
      spacing={1.5}
    >
      <Stack direction="row" flexWrap="wrap" gap={1} alignItems="center">
        <Button
          variant="text"
          color="inherit"
          startIcon={<AssignmentIndOutlinedIcon />}
          size="small"
          disabled={!hasSelection}
          sx={bulkActionButtonSx(hasSelection)}
        >
          Reassign
        </Button>
        <Button
          variant="text"
          color="inherit"
          startIcon={<DeleteOutlineIcon />}
          size="small"
          disabled={!hasSelection}
          sx={bulkActionButtonSx(hasSelection)}
        >
          Discard
        </Button>
        <Button
          variant="text"
          color="inherit"
          startIcon={<CheckCircleOutlineIcon />}
          size="small"
          disabled={!hasSelection}
          sx={bulkActionButtonSx(hasSelection)}
        >
          Mark as complete
        </Button>
      </Stack>
      <Stack direction="row" alignItems="center" spacing={0.5} flexShrink={0}>
        <ListDataGridToolbarActions
          apiRef={apiRef}
          exportFileName="tasks"
          exportAriaLabel="Download tasks"
        />
        <SearchField
          placeholder="Search for a Task name or Ref #"
          value={searchQuery}
          onSearchChange={onSearchChange}
          sx={{
            width: { xs: '100%', sm: 260, lg: 320 },
            flexShrink: 0,
          }}
        />
      </Stack>
    </Stack>
  )
}
