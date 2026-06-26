import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import { useMemo, useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { AppHeader, AppSidebar } from '@/design-system/components'
import { layoutTokens } from '@/design-system/tokens/layout'
import { primaryNavItems } from '@/design-system/tokens/navigation'

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  const pageTitle = useMemo(() => {
    const currentItem = primaryNavItems.find((item) =>
      item.path === '/'
        ? location.pathname === '/'
        : location.pathname.startsWith(item.path),
    )

    return currentItem?.label ?? 'Majesco Unified Prototype'
  }, [location.pathname])

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${layoutTokens.drawerWidth}px)` },
        }}
      >
        <AppHeader
          title={pageTitle}
          onMenuClick={() => setMobileOpen(true)}
        />
        <Box
          component="section"
          sx={{
            mt: `${layoutTokens.headerHeight}px`,
            minHeight: `calc(100vh - ${layoutTokens.headerHeight}px)`,
            py: 3,
          }}
        >
          <Container maxWidth="lg">
            <Outlet />
          </Container>
        </Box>
      </Box>
    </Box>
  )
}
