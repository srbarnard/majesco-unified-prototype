import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link } from 'react-router'
import { useSidebar } from '@/app/contexts/SidebarContext'
import { surfacePanel } from '@/design-system/theme/themeSurfaces'
import { insuredIdFromName } from '@/pages/shared/insuredId'

type ActivityNavItem = {
  label: string
  to: string
}

function insuredPath(insuredName: string) {
  return `/insureds/${encodeURIComponent(insuredIdFromName(insuredName))}`
}

function policyPath(policyNumber: string) {
  return `/policies/${encodeURIComponent(policyNumber)}`
}

function quotePath(quoteNumber: string) {
  return `/quotes/${encodeURIComponent(quoteNumber)}`
}

const insureds: ActivityNavItem[] = [
  { label: 'Atlantic Ridge Construction, LLC', to: insuredPath('Atlantic Ridge Construction, LLC') },
  { label: 'Keystone Commercial Realty', to: insuredPath('Keystone Commercial Realty') },
  { label: 'Blue Harbor Logistics Inc.', to: insuredPath('Blue Harbor Logistics Inc.') },
]

const policies: ActivityNavItem[] = [
  { label: '01-BP-000009546-0', to: policyPath('01-BP-000009546-0') },
  { label: '01-CA-000100005-0', to: policyPath('01-CA-000100005-0') },
  { label: '01-GL-000045821-0', to: policyPath('01-GL-000045821-0') },
]

const quotes: ActivityNavItem[] = [
  { label: '01-QT-000112340-0', to: quotePath('01-QT-000112340-0') },
  { label: '01-QT-000112891-0', to: quotePath('01-QT-000112891-0') },
]

export function ActivityPanel() {
  const { closeSecondaryPanel } = useSidebar()

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: (theme) => surfacePanel(theme) }}>
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
        <NavSection title="Insureds" items={insureds} onNavigate={closeSecondaryPanel} />
        <NavSection title="Policies" items={policies} onNavigate={closeSecondaryPanel} />
        <NavSection title="Quotes" items={quotes} onNavigate={closeSecondaryPanel} />
      </Box>
    </Box>
  )
}

function NavSection({
  title,
  items,
  onNavigate,
}: {
  title: string
  items: ActivityNavItem[]
  onNavigate?: () => void
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
          <ListItemButton
            key={item.label}
            component={Link}
            to={item.to}
            onClick={onNavigate}
            sx={{
              py: 0.75,
              pl: 3,
              color: 'text.primary',
              textDecoration: 'none',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
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
