import CloseIcon from '@mui/icons-material/Close'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import StarIcon from '@mui/icons-material/Star'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link } from 'react-router'
import {
  useFavorites,
  type FavoriteEntity,
} from '@/app/contexts/FavoritesContext'
import { useSidebar } from '@/app/contexts/SidebarContext'
import { EmergencyHomeIcon } from '@/design-system/components'
import { filterHeadingSx } from '@/design-system/components/ListFilterPanel/filterPanelPrimitives'
import { surfacePanel } from '@/design-system/theme/themeSurfaces'

export function FavoritesPanel() {
  const { closeSecondaryPanel } = useSidebar()
  const { watchlist, renewals, highRisk, hrefFor } = useFavorites()

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: (theme) => surfacePanel(theme) }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2, py: 1.5 }}
      >
        <Typography variant="subtitle1" component="h2" sx={filterHeadingSx}>
          Favorites
        </Typography>
        <IconButton size="small" onClick={closeSecondaryPanel} aria-label="Close favorites panel">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Stack>
      <Box sx={{ flex: 1, overflowY: 'auto', py: 1 }}>
        <FavoriteSection
          title="Watchlist"
          items={watchlist}
          hrefFor={hrefFor}
          onNavigate={closeSecondaryPanel}
        />
        <FavoriteSection
          title="Renewals"
          items={renewals}
          hrefFor={hrefFor}
          onNavigate={closeSecondaryPanel}
        />
        <FavoriteSection
          title="High risk"
          items={highRisk}
          hrefFor={hrefFor}
          showRisk
          onNavigate={closeSecondaryPanel}
        />
      </Box>
    </Box>
  )
}

function FavoriteSection({
  title,
  items,
  showRisk = false,
  hrefFor,
  onNavigate,
}: {
  title: string
  items: FavoriteEntity[]
  showRisk?: boolean
  hrefFor: (entity: FavoriteEntity) => string
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
        {items.length === 0 ? (
          <ListItemText
            primary="None"
            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
            sx={{ px: 2.5, py: 0.75 }}
          />
        ) : (
          items.map((item) => (
            <ListItemButton
              key={`${item.kind}:${item.id}`}
              component={Link}
              to={hrefFor(item)}
              onClick={onNavigate}
              sx={{
                py: 0.75,
                pl: 2.5,
                color: 'text.primary',
                textDecoration: 'none',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                {showRisk ? (
                  <EmergencyHomeIcon active sx={{ fontSize: 18 }} />
                ) : (
                  <StarIcon sx={{ fontSize: 18, color: 'warning.main' }} />
                )}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ variant: 'body2', noWrap: true }}
              />
            </ListItemButton>
          ))
        )}
      </List>
    </Box>
  )
}
