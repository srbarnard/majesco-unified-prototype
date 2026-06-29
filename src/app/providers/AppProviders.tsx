import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { useEffect, type ReactNode } from 'react'
import '@/app/config/muiLicense'
import { theme } from '@/design-system/theme'

type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  useEffect(() => {
    document.documentElement.setAttribute('data', 'light')
    document.documentElement.style.colorScheme = 'light'
  }, [])

  return (
    <ThemeProvider theme={theme} defaultMode="light" modeStorageKey={null}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
