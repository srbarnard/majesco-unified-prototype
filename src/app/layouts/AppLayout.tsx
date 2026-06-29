import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import { useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { SidebarProvider } from '@/app/contexts/SidebarContext'
import {
  AppSidebar,
  AppTopNavbar,
  SecondaryNavPanel,
} from '@/design-system/components'
import { layoutTokens } from '@/design-system/tokens/layout'

function AppLayoutContent() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  const isFullBleedPage =
    location.pathname === '/quotes' ||
    location.pathname === '/policies' ||
    /\/policies\/[^/]+/.test(location.pathname)

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden',
        bgcolor: (theme) => theme.figmaPalette.grey[50],
      }}
    >
      <AppTopNavbar onMobileMenuClick={() => setMobileOpen(true)} />

      <Box
        sx={{
          display: 'flex',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
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
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: isFullBleedPage ? 'hidden' : 'auto',
              py: isFullBleedPage ? 0 : 3,
              px: isFullBleedPage ? 0 : `${layoutTokens.contentPaddingX}px`,
              bgcolor: 'background.paper',
            }}
          >
            {isFullBleedPage ? (
              <Outlet />
            ) : (
              <Container maxWidth="lg" sx={{ flexGrow: 1 }}>
                <Outlet />
              </Container>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export function AppLayout() {
  return (
    <SidebarProvider>
      <AppLayoutContent />
    </SidebarProvider>
  )
}
