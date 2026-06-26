import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import type { ReactNode } from 'react'
import { theme } from '@/design-system/theme/theme'

type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider theme={theme} defaultMode="light">
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
