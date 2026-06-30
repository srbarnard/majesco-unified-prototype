import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

/** Desktop layout breakpoint — matches permanent nav rail (lg / 1200px). */
export function useIsDesktopLayout() {
  const theme = useTheme()
  return useMediaQuery(theme.breakpoints.up('lg'))
}
