import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import Stack from '@mui/material/Stack'
import { Button, SearchField } from '@/design-system/components'

type TasksActionBarProps = {
  searchQuery: string
  onSearchChange: (query: string) => void
  hasSelection: boolean
}

export function TasksActionBar({ searchQuery, onSearchChange, hasSelection }: TasksActionBarProps) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      alignItems={{ xs: 'stretch', md: 'center' }}
      justifyContent="space-between"
      spacing={1.5}
    >
      <Stack direction="row" flexWrap="wrap" gap={1} alignItems="center">
        <Button
          variant="outlined"
          color="primary"
          startIcon={<AssignmentIndOutlinedIcon />}
          size="small"
          disabled={!hasSelection}
        >
          Reassign
        </Button>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<DeleteOutlineIcon />}
          size="small"
          disabled={!hasSelection}
        >
          Discard
        </Button>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<CheckCircleOutlineIcon />}
          size="small"
          disabled={!hasSelection}
        >
          Mark as complete
        </Button>
      </Stack>
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
  )
}
