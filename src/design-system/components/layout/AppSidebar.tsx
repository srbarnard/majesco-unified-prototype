import CloseIcon from '@mui/icons-material/Close'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'
import { useCallback, useState } from 'react'
import { NavLink, useLocation } from 'react-router'
import { useSidebar } from '@/app/contexts/SidebarContext'
import { CopilotIcon } from '@/design-system/components'
import { filterHeadingSx } from '@/design-system/components/ListFilterPanel/filterPanelPrimitives'
import { ThemeModeToggle } from '@/design-system/components/layout/ThemeModeToggle'
import { layoutTokens } from '@/design-system/tokens/layout'
import {
  drawerTransitionDuration,
  drawerTransitionEasing,
  navItemActiveIndicatorStyles,
  navItemInteractionStyles,
} from '@/design-system/tokens/motion'
import { getFigmaColors } from '@/design-system/tokens/figma-colors'
import { accentSubtle, surfaceMuted, surfaceSubtle } from '@/design-system/theme/themeSurfaces'
import { moreMenuItems, visibleAppShellNavItems } from '@/design-system/tokens/navigation'

type AppSidebarProps = {
  mobileOpen: boolean
  onMobileClose: () => void
}

type SidebarLayout = 'rail' | 'drawer'

const MOBILE_DRAWER_WIDTH = layoutTokens.drawerWidth

function isRouteActive(pathname: string, path: string, matchPaths?: string[]) {
  if (matchPaths) {
    return matchPaths.some((prefix) => pathname.startsWith(prefix))
  }
  return path === '/' ? pathname === '/' : pathname.startsWith(path)
}

function MobileNavDrawerShell({
  title,
  onClose,
  children,
  footer,
}: {
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          px: 2,
          pt: layoutTokens.policyHeaderTopPadding,
          pb: 1.5,
          bgcolor: (theme) => surfaceMuted(theme),
          borderBottom: 1,
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        <Typography variant="subtitle1" sx={{ ...filterHeadingSx, fontSize: '0.9375rem' }}>
          {title}
        </Typography>
        <IconButton size="small" onClick={onClose} aria-label="Close navigation menu">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {children}
      </Box>

      {footer && (
        <Box
          sx={{
            flexShrink: 0,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: (theme) => surfaceMuted(theme),
          }}
        >
          {footer}
        </Box>
      )}
    </Box>
  )
}

function SidebarContent({
  layout,
  onNavigate,
  hideThemeToggle = false,
}: {
  layout: SidebarLayout
  onNavigate?: () => void
  hideThemeToggle?: boolean
}) {
  const location = useLocation()
  const { secondaryPanel, toggleSecondaryPanel, closeSecondaryPanel } = useSidebar()
  const [moreAnchor, setMoreAnchor] = useState<null | HTMLElement>(null)
  const isDrawer = layout === 'drawer'
  const isSecondaryPanelOpen = secondaryPanel !== null

  const handleRouteNavClick = useCallback(() => {
    closeSecondaryPanel()
    onNavigate?.()
  }, [closeSecondaryPanel, onNavigate])

  const itemSx = (active: boolean) => {
    const inactiveRouteOverride = !active
      ? {
          bgcolor: 'transparent',
          '&.active': {
            bgcolor: 'transparent',
            backgroundColor: 'transparent',
            color: isDrawer ? 'text.primary' : 'text.secondary',
            '& .MuiListItemIcon-root': {
              color: 'inherit',
            },
          },
        }
      : {}

    return isDrawer
      ? {
          ...navItemInteractionStyles,
          ...navItemActiveIndicatorStyles,
          ...inactiveRouteOverride,
          flexDirection: 'row' as const,
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: 1.5,
          py: 1.25,
          px: 2,
          mb: 0.25,
          borderRadius: 1,
          minHeight: 48,
          position: 'relative' as const,
          color: active ? 'primary.main' : 'text.primary',
          ...(active && {
            bgcolor: (theme) => accentSubtle(theme),
          }),
        }
      : {
          ...navItemInteractionStyles,
          ...navItemActiveIndicatorStyles,
          ...inactiveRouteOverride,
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
          ...(active && {
            bgcolor: (theme) => accentSubtle(theme),
          }),
        }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        bgcolor: isDrawer ? 'background.paper' : (theme) => getFigmaColors(theme.palette.mode).background.grey,
      }}
    >
      <List
        component="nav"
        sx={{
          px: isDrawer ? 1 : 0.5,
          py: isDrawer ? 1 : 1.5,
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
        }}
      >
        {visibleAppShellNavItems.map((item) => {
          const Icon = item.icon
          const isPanelActive = item.panel ? secondaryPanel === item.panel : false
          const isRouteItemActive = item.path
            ? !isSecondaryPanelOpen && isRouteActive(location.pathname, item.path, item.matchPaths)
            : false
          const active = isPanelActive || isRouteItemActive

          const label = (
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                variant: isDrawer ? 'body2' : 'caption',
                fontWeight: active ? 600 : isDrawer ? 500 : 500,
                fontSize: isDrawer ? '0.875rem' : '0.6875rem',
                textAlign: isDrawer ? 'left' : 'center',
                lineHeight: 1.2,
              }}
              sx={{ m: 0 }}
            />
          )

          const icon = (
            <ListItemIcon
              sx={{
                minWidth: isDrawer ? 40 : 0,
                mb: isDrawer ? 0 : 0.5,
                color: 'inherit',
                justifyContent: isDrawer ? 'flex-start' : 'center',
              }}
            >
              {item.copilotIcon ? (
                <CopilotIcon size={isDrawer ? 20 : 22} />
              ) : (
                Icon && <Icon sx={{ fontSize: isDrawer ? 20 : 22 }} />
              )}
            </ListItemIcon>
          )

          if (item.panel) {
            return (
              <ListItemButton
                key={item.label}
                onClick={() => toggleSecondaryPanel(item.panel!)}
                selected={isPanelActive}
                data-nav-active={isPanelActive ? 'true' : undefined}
                sx={itemSx(active)}
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
              onClick={handleRouteNavClick}
              data-nav-active={active ? 'true' : undefined}
              sx={itemSx(active)}
            >
              {icon}
              {label}
            </ListItemButton>
          )
        })}

        {isDrawer ? (
          <>
            <Divider sx={{ my: 1 }} />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ px: 2, py: 0.5, display: 'block', fontWeight: 600, letterSpacing: '0.02em' }}
            >
              More
            </Typography>
            {moreMenuItems.map((item) => {
              const moreActive =
                !isSecondaryPanelOpen && isRouteActive(location.pathname, item.path)

              return (
              <ListItemButton
                key={item.path}
                component={NavLink}
                to={item.path}
                onClick={handleRouteNavClick}
                data-nav-active={moreActive ? 'true' : undefined}
                sx={itemSx(moreActive)}
              >
                <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                  {item.copilotIcon ? (
                    <CopilotIcon size={20} />
                  ) : (
                    item.icon && <item.icon sx={{ fontSize: 20 }} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                />
              </ListItemButton>
              )
            })}
          </>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 0.25 }}>
            <IconButton
              aria-label="More navigation options"
              onClick={(event) => setMoreAnchor(event.currentTarget)}
              sx={{
                color: 'text.secondary',
                borderRadius: 1,
                bgcolor: (theme) => surfaceSubtle(theme),
                '&:hover': { bgcolor: (theme) => theme.palette.action.hover },
              }}
            >
              <MoreHorizIcon sx={{ fontSize: 28 }} />
            </IconButton>
          </Box>
        )}
      </List>

      {!hideThemeToggle && <ThemeModeToggle fullWidth={isDrawer} />}

      {!isDrawer && (
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
                handleRouteNavClick()
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
      )}
    </Box>
  )
}

function MobileDrawerContent({ onClose }: { onClose: () => void }) {
  return (
    <MobileNavDrawerShell
      title="Navigation"
      onClose={onClose}
      footer={
        <Box sx={{ px: 2, py: 2 }}>
          <ThemeModeToggle fullWidth />
        </Box>
      }
    >
      <SidebarContent layout="drawer" onNavigate={onClose} hideThemeToggle />
    </MobileNavDrawerShell>
  )
}

export function AppSidebar({ mobileOpen, onMobileClose }: AppSidebarProps) {
  const { navRailWidth } = useSidebar()

  return (
    <>
      <Drawer
        anchor="left"
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        transitionDuration={drawerTransitionDuration}
        slotProps={{
          transition: {
            easing: drawerTransitionEasing,
          },
        }}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiBackdrop-root': {
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.55)' : 'rgba(0, 0, 0, 0.32)',
          },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: `min(100vw, ${MOBILE_DRAWER_WIDTH}px)`,
            maxWidth: '100%',
            height: '100%',
            borderRight: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '4px 0 24px rgba(0, 0, 0, 0.45)'
                : '4px 0 24px rgba(0, 0, 0, 0.12)',
          },
        }}
      >
        <MobileDrawerContent onClose={onMobileClose} />
      </Drawer>

      <Box
        component="nav"
        aria-label="Main navigation"
        sx={{
          width: navRailWidth,
          flexShrink: 0,
          height: '100%',
          minHeight: 0,
          borderRight: 1,
          borderColor: 'divider',
          bgcolor: (theme) => getFigmaColors(theme.palette.mode).background.grey,
          overflow: 'hidden',
          display: { xs: 'none', lg: 'block' },
        }}
      >
        <SidebarContent layout="rail" />
      </Box>
    </>
  )
}
