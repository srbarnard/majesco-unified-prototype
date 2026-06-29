import MenuIcon from '@mui/icons-material/Menu'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import AppBar from '@mui/material/AppBar'
import Avatar from '@mui/material/Avatar'
import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { useSidebar } from '@/app/contexts/SidebarContext'
import { layoutTokens } from '@/design-system/tokens/layout'

type AppHeaderProps = {
  title: string
  onMenuClick: () => void
}

export function AppHeader({ title, onMenuClick }: AppHeaderProps) {
  const { leftOffsetWidth } = useSidebar()

  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={0}
      sx={{
        width: { md: `calc(100% - ${leftOffsetWidth}px)` },
        ml: { md: `${leftOffsetWidth}px` },
        transition: 'width 0.2s, margin 0.2s',
      }}
    >
      <Toolbar sx={{ minHeight: layoutTokens.headerHeight, gap: 1 }}>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 1, display: { md: 'none' } }}
          aria-label="Open navigation"
        >
          <MenuIcon />
        </IconButton>
        <Typography
          variant="h6"
          component="h1"
          noWrap
          color="text.primary"
          sx={{ flexGrow: 1, textTransform: 'uppercase', letterSpacing: '0.02em' }}
        >
          {title}
        </Typography>
        <IconButton color="inherit" aria-label="Notifications">
          <NotificationsNoneOutlinedIcon />
        </IconButton>
        <Avatar sx={{ width: 32, height: 32, ml: 0.5 }}>SB</Avatar>
      </Toolbar>
    </AppBar>
  )
}
