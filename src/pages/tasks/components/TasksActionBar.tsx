import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import type { SxProps, Theme } from '@mui/material/styles'
import type { GridApi } from '@mui/x-data-grid-premium'
import type { MutableRefObject } from 'react'
import { Button, ExpandableSearchField, ListDataGridToolbarActions } from '@/design-system/components'
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
    <ExpandableSearchField
      placeholder="Search for a Task name or Ref #"
      value={searchQuery}
      onSearchChange={onSearchChange}
      desktopWidth={{ sm: 260, lg: 320 }}
      startContent={
        <>
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
          <ListDataGridToolbarActions
            apiRef={apiRef}
            exportFileName="tasks"
            exportAriaLabel="Download tasks"
          />
        </>
      }
    />
  )
}
