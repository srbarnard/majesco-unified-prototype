import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

/** Desktop layout breakpoint — matches permanent nav rail (lg / 1200px). */
export function useIsDesktopLayout() {
  const theme = useTheme()
  // Client-only app: resolve the real viewport on first paint (avoids wrong drawer chrome on phones).
  return useMediaQuery(theme.breakpoints.up('lg'), { noSsr: true })
}
