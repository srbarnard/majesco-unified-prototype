import Box from '@mui/material/Box'
import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { GlobalSearchProvider } from '@/app/contexts/GlobalSearchContext'
import { SidebarProvider } from '@/app/contexts/SidebarContext'
import {
  AppSidebar,
  AppTopNavbar,
  SecondaryNavPanel,
} from '@/design-system/components'
import { layoutTokens } from '@/design-system/tokens/layout'
import { surfaceApp } from '@/design-system/theme/themeSurfaces'

function AppLayoutContent() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const isFullBleedPage =
    location.pathname === '/' ||
    location.pathname === '/quotes' ||
    location.pathname === '/tasks' ||
    location.pathname === '/policies' ||
    location.pathname === '/copilot-studio' ||
    /\/policies\/[^/]+/.test(location.pathname) ||
    /\/quotes\/[^/]+/.test(location.pathname) ||
    /\/insureds\/[^/]+/.test(location.pathname)

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden',
        bgcolor: (theme) => surfaceApp(theme),
      }}
    >
      <AppTopNavbar onMobileMenuClick={() => setMobileOpen((open) => !open)} />

      <Box
        sx={{
          display: 'flex',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <AppSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
        <SecondaryNavPanel />

        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            bgcolor: 'background.paper',
          }}
        >
          <Box
            component="section"
            sx={{
              flex: 1,
              minHeight: 0,
              minWidth: 0,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: isFullBleedPage ? 'hidden' : 'auto',
              py: isFullBleedPage ? 0 : 3,
              px: isFullBleedPage ? 0 : `${layoutTokens.contentPaddingX}px`,
              bgcolor: 'background.paper',
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export function AppLayout() {
  return (
    <SidebarProvider>
      <GlobalSearchProvider>
        <AppLayoutContent />
      </GlobalSearchProvider>
    </SidebarProvider>
  )
}
