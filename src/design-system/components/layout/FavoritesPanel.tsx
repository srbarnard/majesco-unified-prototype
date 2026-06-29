import CloseIcon from '@mui/icons-material/Close'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import StarIcon from '@mui/icons-material/Star'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useSidebar } from '@/app/contexts/SidebarContext'

const watchlist = [
  { label: '01-BP-000009546-0', starred: true },
  { label: 'Atlantic Ridge Construction, LLC', starred: true },
  { label: 'Blue Harbor Logistics Inc.', starred: true },
]

const renewals = [
  { label: '01-CA-000100005-0', starred: true },
  { label: '01-GL-000045821-0', starred: true },
]

const highRisk = [
  { label: '01-WC-000078234-0', risk: true },
  { label: 'Red Oak Hospitality Group', risk: true },
]

export function FavoritesPanel() {
  const { closeSecondaryPanel } = useSidebar()

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: (theme) => theme.figmaPalette.grey[100] }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}
      >
        <Typography variant="subtitle1" fontWeight={600}>
          Favorites
        </Typography>
        <IconButton size="small" onClick={closeSecondaryPanel} aria-label="Close favorites panel">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Stack>
      <Box sx={{ flex: 1, overflowY: 'auto', py: 1 }}>
        <FavoriteSection title="Watchlist" items={watchlist} />
        <FavoriteSection title="Renewals" items={renewals} />
        <FavoriteSection title="High risk" items={highRisk} showRisk />
      </Box>
    </Box>
  )
}

function FavoriteSection({
  title,
  items,
  showRisk = false,
}: {
  title: string
  items: { label: string; starred?: boolean; risk?: boolean }[]
  showRisk?: boolean
}) {
  return (
    <Box sx={{ mb: 1 }}>
      <ListItemButton sx={{ py: 0.75 }}>
        <ListItemText
          primary={title}
          primaryTypographyProps={{ variant: 'subtitle2', fontWeight: 600 }}
        />
        <ExpandMoreIcon fontSize="small" color="action" />
      </ListItemButton>
      <List dense disablePadding>
        {items.map((item) => (
          <ListItemButton key={item.label} sx={{ py: 0.75, pl: 2.5 }}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              {showRisk ? (
                <WarningAmberOutlinedIcon sx={{ fontSize: 18, color: 'warning.main' }} />
              ) : (
                <StarIcon sx={{ fontSize: 18, color: 'warning.main' }} />
              )}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{ variant: 'body2', noWrap: true }}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  )
}
