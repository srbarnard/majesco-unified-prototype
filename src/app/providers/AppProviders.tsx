import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import type { ReactNode } from 'react'
import '@/app/config/muiLicense'
import { theme } from '@/design-system/theme'

type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider theme={theme} defaultMode="light" modeStorageKey="majesco-color-mode">
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
