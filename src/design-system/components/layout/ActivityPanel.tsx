import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useSidebar } from '@/app/contexts/SidebarContext'

const insureds = [
  'Atlantic Ridge Construction, LLC',
  'Keystone Commercial Realty',
  'Blue Harbor Logistics Inc.',
]

const policies = ['01-BP-000009546-0', '01-CA-000100005-0', '01-GL-000045821-0']

const quotes = ['01-QT-000112340-0', '01-QT-000112891-0']

export function ActivityPanel() {
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
          Activity
        </Typography>
        <IconButton size="small" onClick={closeSecondaryPanel} aria-label="Close activity panel">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Stack>
      <Box sx={{ flex: 1, overflowY: 'auto', py: 1 }}>
        <NavSection title="Insureds" items={insureds} />
        <NavSection title="Policies" items={policies} />
        <NavSection title="Quotes" items={quotes} />
      </Box>
    </Box>
  )
}

function NavSection({ title, items }: { title: string; items: string[] }) {
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
          <ListItemButton key={item} sx={{ py: 0.75, pl: 3 }}>
            <ListItemText
              primary={item}
              primaryTypographyProps={{ variant: 'body2', noWrap: true }}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  )
}
