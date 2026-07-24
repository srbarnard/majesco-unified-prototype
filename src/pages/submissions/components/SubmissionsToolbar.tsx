import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import Stack from '@mui/material/Stack'
import { Button, SearchField } from '@/design-system/components'

type SubmissionsToolbarProps = {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectionCount: number
  onAssign?: () => void
  onDiscard?: () => void
}

export function SubmissionsToolbar({
  searchQuery,
  onSearchChange,
  selectionCount,
  onAssign,
  onDiscard,
}: SubmissionsToolbarProps) {
  const hasSelection = selectionCount > 0

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'stretch', sm: 'center' }}
      justifyContent="space-between"
      spacing={1}
    >
      <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
        <Button
          size="small"
          variant="text"
          color="inherit"
          startIcon={<PersonOutlineIcon />}
          disabled={!hasSelection}
          onClick={onAssign}
        >
          Assign
        </Button>
        <Button
          size="small"
          variant="text"
          color="inherit"
          startIcon={<DeleteOutlineIcon />}
          disabled={!hasSelection}
          onClick={onDiscard}
        >
          Discard
        </Button>
      </Stack>
      <SearchField
        placeholder="Search submissions"
        value={searchQuery}
        onSearchChange={onSearchChange}
        sx={{
          width: { xs: '100%', sm: 220, lg: 280 },
          alignSelf: { xs: 'stretch', sm: 'auto' },
        }}
      />
    </Stack>
  )
}
