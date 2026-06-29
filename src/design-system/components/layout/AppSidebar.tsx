import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { NavLink, useLocation } from 'react-router'
import { useSidebar } from '@/app/contexts/SidebarContext'
import { CopilotIcon } from '@/design-system/components'
import { layoutTokens } from '@/design-system/tokens/layout'
import { moreMenuItems, visibleAppShellNavItems } from '@/design-system/tokens/navigation'

type AppSidebarProps = {
  mobileOpen: boolean
  onMobileClose: () => void
}

function isRouteActive(pathname: string, path: string, matchPaths?: string[]) {
  if (matchPaths) {
    return matchPaths.some((prefix) => pathname.startsWith(prefix))
  }
  return path === '/' ? pathname === '/' : pathname.startsWith(path)
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation()
  const { secondaryPanel, toggleSecondaryPanel } = useSidebar()
  const [moreAnchor, setMoreAnchor] = useState<null | HTMLElement>(null)

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: (theme) => theme.figmaPalette.grey[50],
      }}
    >
      <List component="nav" sx={{ px: 0.5, py: 1.5 }}>
        {visibleAppShellNavItems.map((item) => {
          const Icon = item.icon
          const isPanelActive = item.panel ? secondaryPanel === item.panel : false
          const isRouteItemActive = item.path
            ? isRouteActive(location.pathname, item.path, item.matchPaths)
            : false
          const active = isPanelActive || isRouteItemActive

          const itemSx = {
            flexDirection: 'column' as const,
            alignItems: 'center',
            justifyContent: 'center',
            py: 1.25,
            px: 0.5,
            mb: 0.25,
            borderRadius: 1,
            minHeight: 64,
            position: 'relative' as const,
            color: active ? 'primary.main' : 'text.secondary',
            '&.active, &.Mui-selected': {
              bgcolor: (theme: { figmaPalette: { blue: Record<number, string> } }) =>
                theme.figmaPalette.blue[50],
              color: 'primary.main',
            },
            '&::before': active
              ? {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: 8,
                  bottom: 8,
                  width: 3,
                  borderRadius: '0 2px 2px 0',
                  bgcolor: 'primary.main',
                }
              : undefined,
          }

          const label = (
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                variant: 'caption',
                fontWeight: active ? 600 : 500,
                fontSize: '0.6875rem',
                textAlign: 'center',
                lineHeight: 1.2,
              }}
              sx={{ m: 0 }}
            />
          )

          const icon = (
            <ListItemIcon sx={{ minWidth: 0, mb: 0.5, color: 'inherit' }}>
              {item.copilotIcon ? (
                <CopilotIcon size={22} />
              ) : (
                Icon && <Icon sx={{ fontSize: 22 }} />
              )}
            </ListItemIcon>
          )

          if (item.panel) {
            return (
              <ListItemButton
                key={item.label}
                onClick={() => {
                  toggleSecondaryPanel(item.panel!)
                  onNavigate?.()
                }}
                selected={isPanelActive}
                sx={itemSx}
              >
                {icon}
                {label}
              </ListItemButton>
            )
          }

          return (
            <ListItemButton
              key={item.path ?? item.label}
              component={NavLink}
              to={item.path!}
              end={item.path === '/'}
              onClick={onNavigate}
              sx={itemSx}
            >
              {icon}
              {label}
            </ListItemButton>
          )
        })}

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 0.25 }}>
          <IconButton
            aria-label="More navigation options"
            onClick={(event) => setMoreAnchor(event.currentTarget)}
            sx={{
              color: 'text.secondary',
              borderRadius: 1,
              bgcolor: (theme) => theme.figmaPalette.grey[100],
              '&:hover': { bgcolor: (theme) => theme.figmaPalette.grey[200] },
            }}
          >
            <MoreHorizIcon sx={{ fontSize: 28 }} />
          </IconButton>
        </Box>
      </List>

      <Menu
        anchorEl={moreAnchor}
        open={Boolean(moreAnchor)}
        onClose={() => setMoreAnchor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 220,
              borderRadius: 1,
              border: 1,
              borderColor: 'divider',
              boxShadow: 2,
            },
          },
        }}
      >
        {moreMenuItems.map((item) => (
          <MenuItem
            key={item.path}
            component={NavLink}
            to={item.path}
            onClick={() => {
              setMoreAnchor(null)
              onNavigate?.()
            }}
            sx={{ py: 1, gap: 1.5 }}
          >
            <ListItemIcon sx={{ minWidth: 0 }}>
              {item.copilotIcon ? (
                <CopilotIcon size={20} />
              ) : (
                item.icon && <item.icon sx={{ fontSize: 20, color: 'text.secondary' }} />
              )}
            </ListItemIcon>
            <Typography variant="body2">{item.label}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  )
}

export function AppSidebar({ mobileOpen, onMobileClose }: AppSidebarProps) {
  const { navRailWidth } = useSidebar()

  return (
    <Box
      component="nav"
      sx={{
        width: { xs: 0, md: navRailWidth },
        flexShrink: 0,
        height: '100%',
        minHeight: 0,
        borderRight: 1,
        borderColor: 'divider',
        bgcolor: (theme) => theme.figmaPalette.grey[50],
        overflow: 'hidden',
        display: { xs: 'none', md: 'block' },
      }}
      aria-label="Main navigation"
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: layoutTokens.drawerWidth,
            top: layoutTokens.headerHeight,
            height: `calc(100% - ${layoutTokens.headerHeight}px)`,
          },
        }}
      >
        <SidebarContent onNavigate={onMobileClose} />
      </Drawer>
      <Box sx={{ height: '100%', display: { xs: 'none', md: 'block' } }}>
        <SidebarContent />
      </Box>
    </Box>
  )
}
