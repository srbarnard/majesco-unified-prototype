import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { NavLink } from 'react-router'
import { primaryNavItems } from '@/design-system/tokens/navigation'
import { layoutTokens } from '@/design-system/tokens/layout'

type AppSidebarProps = {
  mobileOpen: boolean
  onMobileClose: () => void
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ px: 2 }}>
        <Typography variant="h6" component="div" fontWeight={700}>
          Majesco
        </Typography>
      </Toolbar>
      <Divider />
      <List component="nav" sx={{ px: 1, py: 2, flexGrow: 1 }}>
        {primaryNavItems.map((item) => {
          const Icon = item.icon

          return (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
              end={item.path === '/'}
              onClick={onNavigate}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                '&.active': {
                  bgcolor: 'action.selected',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          )
        })}
      </List>
    </Box>
  )
}

export function AppSidebar({ mobileOpen, onMobileClose }: AppSidebarProps) {
  return (
    <Box
      component="nav"
      sx={{ width: { md: layoutTokens.drawerWidth }, flexShrink: { md: 0 } }}
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
          },
        }}
      >
        <SidebarContent onNavigate={onMobileClose} />
      </Drawer>
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: layoutTokens.drawerWidth,
          },
        }}
      >
        <SidebarContent />
      </Drawer>
    </Box>
  )
}
