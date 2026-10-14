import CloseIcon from '@mui/icons-material/Close'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import Box from '@mui/material/Box'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import MenuList from '@mui/material/MenuList'
import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'
import Stack from '@mui/material/Stack'
import Slide from '@mui/material/Slide'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import type { DragEvent, ReactNode } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router'
import { CLAIMS_ONLY } from '@/app/config/claimsOnly'
import { useSidebar } from '@/app/contexts/SidebarContext'
import { CopilotIcon } from '@/design-system/components'
import { filterHeadingSx } from '@/design-system/components/ListFilterPanel/filterPanelPrimitives'
import { ThemeModeToggle } from '@/design-system/components/layout/ThemeModeToggle'
import { layoutTokens } from '@/design-system/tokens/layout'
import {
  drawerTransitionDuration,
  getDrawerTransitionSlotProps,
  navItemActiveIndicatorStyles,
  navItemInteractionStyles,
} from '@/design-system/tokens/motion'
import { figmaBorderRadius } from '@/design-system/tokens/figma-border-radius'
import { getFigmaColors } from '@/design-system/tokens/figma-colors'
import { accentSubtle, surfaceMuted, surfaceSubtle } from '@/design-system/theme/themeSurfaces'
import {
  claimsOnlyShellNavItems,
  moreMenuItems,
  visibleAppShellNavItems,
  type NavItem,
} from '@/design-system/tokens/navigation'

type AppSidebarProps = {
  mobileOpen: boolean
  onMobileClose: () => void
}

type SidebarLayout = 'rail' | 'drawer'

const MOBILE_DRAWER_WIDTH = layoutTokens.drawerWidth

type NavListId = 'main' | 'more'
type NavOrder = Record<NavListId, string[]>

const PINNED_TOP_LABEL = 'Home'
const NAV_ORDER_STORAGE_KEY = 'leftNav.order'

/** Claims opens the section landing. Home and every other item stay visible. */
const CLAIMS_ONLY_NAVIGABLE = new Set(['Claims'])

function isClaimsOnlyNavigable(label: string) {
  return !CLAIMS_ONLY || CLAIMS_ONLY_NAVIGABLE.has(label)
}

const shellNavItems = CLAIMS_ONLY ? claimsOnlyShellNavItems : visibleAppShellNavItems
const shellMoreItems = moreMenuItems

const navItemsByLabel = new Map<string, NavItem>(
  [...shellNavItems, ...shellMoreItems].map((item) => [item.label, item]),
)

const DEFAULT_NAV_ORDER: NavOrder = {
  main: shellNavItems.map((item) => item.label).filter((label) => label !== PINNED_TOP_LABEL),
  more: shellMoreItems.map((item) => item.label),
}

function readStoredNavOrder(): NavOrder {
  try {
    const stored = JSON.parse(sessionStorage.getItem(NAV_ORDER_STORAGE_KEY) ?? 'null') as Partial<NavOrder> | null
    if (!stored || !Array.isArray(stored.main) || !Array.isArray(stored.more)) return DEFAULT_NAV_ORDER
    const known = new Set([...DEFAULT_NAV_ORDER.main, ...DEFAULT_NAV_ORDER.more])
    const seen = new Set<string>()
    const clean = (list: unknown[]) =>
      list.filter((key): key is string => {
        if (typeof key !== 'string' || !known.has(key) || seen.has(key)) return false
        seen.add(key)
        return true
      })
    const main = clean(stored.main)
    const more = clean(stored.more)
    // New destinations land after their default predecessor, not at the end of a saved order.
    const insertMissing = (list: string[], defaults: string[]) => {
      defaults.forEach((key, index) => {
        if (seen.has(key)) return
        seen.add(key)
        const before = defaults.slice(0, index).reverse().find((candidate) => list.includes(candidate))
        list.splice(before ? list.indexOf(before) + 1 : 0, 0, key)
      })
    }
    insertMissing(main, DEFAULT_NAV_ORDER.main)
    insertMissing(more, DEFAULT_NAV_ORDER.more)
    return { main, more }
  } catch {
    return DEFAULT_NAV_ORDER
  }
}

/** Moves `key` into `list` at `targetKey`'s index (end of list when null). */
function moveNavItem(order: NavOrder, key: string, list: NavListId, targetKey: string | null): NavOrder {
  const target = order[list]
  const to = targetKey ? target.indexOf(targetKey) : target.length
  if (to < 0) return order
  const from = target.indexOf(key)
  if (from === to || (from === target.length - 1 && to === target.length)) return order
  const next: NavOrder = {
    main: order.main.filter((k) => k !== key),
    more: order.more.filter((k) => k !== key),
  }
  next[list].splice(Math.min(to, next[list].length), 0, key)
  return next
}

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
        // Clear the fixed bottom tool bar so the theme toggle stays reachable.
        pb: `calc(${layoutTokens.toolRailBottomHeight}px + env(safe-area-inset-bottom, 0px))`,
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
  const [navOrder, setNavOrder] = useState<NavOrder>(readStoredNavOrder)
  const [dragKey, setDragKey] = useState<string | null>(null)
  const isDrawer = layout === 'drawer'
  const isSecondaryPanelOpen = secondaryPanel !== null

  useEffect(() => {
    sessionStorage.setItem(NAV_ORDER_STORAGE_KEY, JSON.stringify(navOrder))
  }, [navOrder])

  // A dragged item can unmount mid-drag when it moves between the rail and More,
  // so its own dragend never fires; reset from window-level events instead.
  useEffect(() => {
    if (!dragKey) return
    const clear = () => setDragKey(null)
    window.addEventListener('drop', clear)
    window.addEventListener('dragend', clear)
    window.addEventListener('pointermove', clear)
    return () => {
      window.removeEventListener('drop', clear)
      window.removeEventListener('dragend', clear)
      window.removeEventListener('pointermove', clear)
    }
  }, [dragKey])

  const dragHandlers = (key: string, list: NavListId) => ({
    draggable: true,
    onDragStart: (event: DragEvent) => {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', key)
      setDragKey(key)
    },
    onDragOver: (event: DragEvent) => {
      if (!dragKey) return
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'
      if (dragKey !== key) setNavOrder((current) => moveNavItem(current, dragKey, list, key))
    },
    onDrop: (event: DragEvent) => {
      event.preventDefault()
      setDragKey(null)
    },
    onDragEnd: () => setDragKey(null),
  })

  const allowDrop = (event: DragEvent) => {
    if (!dragKey) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }

  const dropIntoMore = (event: DragEvent) => {
    if (!dragKey) return
    event.preventDefault()
    setNavOrder((current) => (current.more.includes(dragKey) ? current : moveNavItem(current, dragKey, 'more', null)))
    setDragKey(null)
  }

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
          borderRadius: `${figmaBorderRadius.borderRadius}px`,
          minHeight: 48,
          flex: '0 0 auto',
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
          borderRadius: `${figmaBorderRadius.borderRadius}px`,
          minHeight: 64,
          flex: '0 0 auto',
          position: 'relative' as const,
          color: active ? 'primary.main' : 'text.secondary',
          ...(active && {
            bgcolor: (theme) => accentSubtle(theme),
          }),
        }
  }

  const renderNavItem = (item: NavItem, navList?: NavListId) => {
    const Icon = item.icon
    const navigable = isClaimsOnlyNavigable(item.label)
    const list = navList
    const isPanelActive = item.panel ? secondaryPanel === item.panel : false
    const isRouteItemActive = item.path
      ? !isSecondaryPanelOpen && isRouteActive(location.pathname, item.path, item.matchPaths)
      : false
    const active = navigable && (isPanelActive || isRouteItemActive)
    const drag = list ? dragHandlers(item.label, list) : { draggable: false }
    const dragSx = list
      ? { opacity: dragKey === item.label ? 0.4 : 1, cursor: dragKey ? 'grabbing' : undefined }
      : {}

    const label = (
      <ListItemText
        primary={item.label}
        primaryTypographyProps={{
          variant: isDrawer ? 'body2' : 'caption',
          fontWeight: active ? 600 : 500,
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
          <CopilotIcon size={18} active={active} />
        ) : (
          Icon && <Icon sx={{ fontSize: isDrawer ? 20 : 22 }} />
        )}
      </ListItemIcon>
    )

    if (!navigable) {
      return (
        <ListItemButton
          key={item.label}
          {...drag}
          aria-disabled
          disableRipple
          onClick={(event) => event.preventDefault()}
          sx={{
            ...itemSx(false),
            ...dragSx,
            color: 'text.disabled',
            '&:hover': { bgcolor: 'transparent' },
            '&:active': { transform: 'none' },
          }}
        >
          {icon}
          {label}
        </ListItemButton>
      )
    }

    if (item.panel) {
      return (
        <ListItemButton
          key={item.label}
          {...drag}
          onClick={() => toggleSecondaryPanel(item.panel!)}
          selected={isPanelActive}
          data-nav-active={isPanelActive ? 'true' : undefined}
          sx={{ ...itemSx(active), ...dragSx }}
        >
          {icon}
          {label}
        </ListItemButton>
      )
    }

    return (
      <ListItemButton
        key={item.label}
        {...drag}
        component={NavLink}
        to={item.path!}
        end={item.path === '/'}
        onClick={handleRouteNavClick}
        data-nav-active={active ? 'true' : undefined}
        sx={{ ...itemSx(active), ...dragSx }}
      >
        {icon}
        {label}
      </ListItemButton>
    )
  }

  const homeItem = navItemsByLabel.get(PINNED_TOP_LABEL)
  const resolveItems = (keys: string[]) =>
    keys.map((key) => navItemsByLabel.get(key)).filter((item): item is NavItem => Boolean(item))
  const mainItems = resolveItems(navOrder.main)
  const moreItems = resolveItems(navOrder.more)
  const moreHasActiveRoute =
    !isSecondaryPanelOpen &&
    moreItems.some((item) => item.path && isRouteActive(location.pathname, item.path, item.matchPaths))

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
        onDragOver={allowDrop}
        sx={{
          px: isDrawer ? 1 : 0.5,
          py: isDrawer ? 1 : 1.5,
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {homeItem && renderNavItem(homeItem)}
        {mainItems.map((item) => renderNavItem(item, 'main'))}

        {isDrawer ? (
          <>
            <Divider sx={{ my: 1 }} />
            <Typography
              variant="caption"
              color="text.secondary"
              onDragOver={(event) => {
                allowDrop(event)
                if (dragKey && !navOrder.more.includes(dragKey)) {
                  setNavOrder((current) => moveNavItem(current, dragKey, 'more', current.more[0] ?? null))
                }
              }}
              onDrop={dropIntoMore}
              sx={{ px: 2, py: 0.5, display: 'block', fontWeight: 600, letterSpacing: '0.02em' }}
            >
              More
            </Typography>
            {moreItems.map((item) => renderNavItem(item, 'more'))}
          </>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 0.25, mb: 0.5 }}>
            <IconButton
              aria-label="More navigation options"
              aria-haspopup="menu"
              aria-expanded={Boolean(moreAnchor)}
              onClick={(event) => {
                const target = event.currentTarget
                setMoreAnchor((current) => (current ? null : target))
              }}
              onDragEnter={(event) => {
                if (dragKey) setMoreAnchor(event.currentTarget)
              }}
              onDragOver={allowDrop}
              onDrop={dropIntoMore}
              sx={{
                color: moreHasActiveRoute ? 'primary.main' : 'text.secondary',
                borderRadius: `${figmaBorderRadius.borderRadius}px`,
                bgcolor: (theme) => (moreHasActiveRoute ? accentSubtle(theme) : surfaceSubtle(theme)),
                '&:hover': { bgcolor: (theme) => theme.palette.action.hover },
              }}
            >
              <MoreHorizIcon sx={{ fontSize: 28 }} />
            </IconButton>
          </Box>
        )}

        <Box
          aria-hidden
          data-nav-end-drop
          onDragOver={(event) => {
            allowDrop(event)
            if (dragKey) setNavOrder((current) => moveNavItem(current, dragKey, 'main', null))
          }}
          sx={{ flex: '1 0 24px !important' }}
        />
      </List>

      {!hideThemeToggle && <ThemeModeToggle fullWidth={isDrawer} />}

      {!isDrawer && (
        <Popper
          open={Boolean(moreAnchor)}
          anchorEl={moreAnchor}
          placement="right-end"
          modifiers={[{ name: 'offset', options: { offset: [0, 8] } }]}
          sx={{ zIndex: (theme) => theme.zIndex.modal }}
        >
          <ClickAwayListener onClickAway={() => setMoreAnchor(null)}>
            <Paper
              onDragOver={allowDrop}
              onDrop={dropIntoMore}
              sx={{
                minWidth: 220,
                borderRadius: `${figmaBorderRadius.borderRadius}px`,
                border: 1,
                borderColor: 'divider',
                boxShadow: 2,
              }}
            >
              <MenuList
                aria-label="More navigation"
                onKeyDown={(event) => {
                  if (event.key === 'Escape') setMoreAnchor(null)
                }}
                sx={{ py: 1 }}
              >
                {moreItems.map((item) => {
                  const content = (
                    <>
                      <ListItemIcon sx={{ minWidth: 0 }}>
                        {item.copilotIcon ? (
                          <CopilotIcon size={20} />
                        ) : (
                          item.icon && (
                            <item.icon
                              sx={{
                                fontSize: 20,
                                color: isClaimsOnlyNavigable(item.label) ? 'text.secondary' : 'inherit',
                              }}
                            />
                          )
                        )}
                      </ListItemIcon>
                      <Typography variant="body2" color="inherit">
                        {item.label}
                      </Typography>
                    </>
                  )
                  const menuItemSx = { py: 1, gap: 1.5, opacity: dragKey === item.label ? 0.4 : 1 }

                  if (!isClaimsOnlyNavigable(item.label)) {
                    return (
                      <MenuItem
                        key={item.label}
                        {...dragHandlers(item.label, 'more')}
                        aria-disabled
                        disableRipple
                        onClick={(event) => event.preventDefault()}
                        sx={{
                          ...menuItemSx,
                          color: 'text.disabled',
                          '&:hover': { bgcolor: 'transparent' },
                        }}
                      >
                        {content}
                      </MenuItem>
                    )
                  }

                  if (item.panel) {
                    return (
                      <MenuItem
                        key={item.label}
                        {...dragHandlers(item.label, 'more')}
                        onClick={() => {
                          setMoreAnchor(null)
                          toggleSecondaryPanel(item.panel!)
                        }}
                        sx={menuItemSx}
                      >
                        {content}
                      </MenuItem>
                    )
                  }

                  return (
                    <MenuItem
                      key={item.label}
                      {...dragHandlers(item.label, 'more')}
                      component={NavLink}
                      to={item.path!}
                      onClick={() => {
                        setMoreAnchor(null)
                        handleRouteNavClick()
                      }}
                      sx={menuItemSx}
                    >
                      {content}
                    </MenuItem>
                  )
                })}
                {moreItems.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 1 }}>
                    Drag items here
                  </Typography>
                )}
              </MenuList>
            </Paper>
          </ClickAwayListener>
        </Popper>
      )}
    </Box>
  )
}

function MobileDrawerContent({ onClose }: { onClose: () => void }) {
  return (
    <MobileNavDrawerShell title="Navigation" onClose={onClose}>
      <SidebarContent layout="drawer" onNavigate={onClose} />
    </MobileNavDrawerShell>
  )
}

export function AppSidebar({ mobileOpen, onMobileClose }: AppSidebarProps) {
  const theme = useTheme()
  const isDesktopNav = useMediaQuery(theme.breakpoints.up('lg'))
  const { navRailWidth } = useSidebar()

  return (
    <>
      {!isDesktopNav && (
        <Drawer
          anchor="left"
          variant="temporary"
          open={mobileOpen}
          slots={{ transition: Slide }}
          onClose={onMobileClose}
          transitionDuration={drawerTransitionDuration}
          slotProps={getDrawerTransitionSlotProps()}
          ModalProps={{ keepMounted: true }}
          sx={{
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
      )}

      {isDesktopNav && (
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
          }}
        >
          <SidebarContent layout="rail" />
        </Box>
      )}
    </>
  )
}
