import MenuIcon from '@mui/icons-material/Menu'
import AppBar from '@mui/material/AppBar'
import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { layoutTokens } from '@/design-system/tokens/layout'

type AppHeaderProps = {
  title: string
  onMenuClick: () => void
}

export function AppHeader({ title, onMenuClick }: AppHeaderProps) {
  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={0}
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        width: { md: `calc(100% - ${layoutTokens.drawerWidth}px)` },
        ml: { md: `${layoutTokens.drawerWidth}px` },
      }}
    >
      <Toolbar sx={{ minHeight: layoutTokens.headerHeight }}>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { md: 'none' } }}
          aria-label="Open navigation"
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="h1" noWrap>
          {title}
        </Typography>
      </Toolbar>
    </AppBar>
  )
}
