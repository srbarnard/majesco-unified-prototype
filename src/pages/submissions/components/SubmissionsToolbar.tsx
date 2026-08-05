import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import { Button, ExpandableSearchField } from '@/design-system/components'

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
    <ExpandableSearchField
      placeholder="Search submissions"
      value={searchQuery}
      onSearchChange={onSearchChange}
      desktopWidth={{ sm: 220, lg: 280 }}
      startContent={
        <>
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
        </>
      }
    />
  )
}
