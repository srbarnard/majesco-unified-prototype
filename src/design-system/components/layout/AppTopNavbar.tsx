import MenuIcon from '@mui/icons-material/Menu'
import AddIcon from '@mui/icons-material/Add'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import SearchIcon from '@mui/icons-material/Search'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import AppBar from '@mui/material/AppBar'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { GlobalSearchField } from '@/design-system/components/GlobalSearch/GlobalSearchField'
import { useBrowserHistoryNavigation } from '@/hooks/useBrowserHistoryNavigation'
import { layoutTokens } from '@/design-system/tokens/layout'
import { surfaceMuted } from '@/design-system/theme/themeSurfaces'

const historyNavButtonSx = {
  color: 'text.secondary',
  '&:hover': {
    bgcolor: 'action.hover',
  },
  '&.Mui-disabled': {
    color: 'action.disabled',
    opacity: 0.45,
  },
} as const

type AppTopNavbarProps = {
  userInitials?: string
  onMobileMenuClick?: () => void
}

type CreateMenuItem = {
  label: string
  disabled: boolean
  path?: string
}

const CREATE_MENU_ITEMS: CreateMenuItem[] = [
  { label: 'Customer', disabled: true },
  { label: 'Quote', disabled: false, path: '/quotes/new' },
  { label: 'Policy', disabled: true },
  { label: 'Claim', disabled: true },
  { label: 'Task', disabled: true },
]

export function AppTopNavbar({ userInitials = 'CR', onMobileMenuClick }: AppTopNavbarProps) {
  const navigate = useNavigate()
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [createMenuAnchor, setCreateMenuAnchor] = useState<null | HTMLElement>(null)
  const { canGoBack, canGoForward, goBack, goForward } = useBrowserHistoryNavigation()

  const handleCreateMenuClose = () => setCreateMenuAnchor(null)

  const handleCreateMenuSelect = (path?: string) => {
    handleCreateMenuClose()
    if (path) navigate(path)
  }

  return (
    <AppBar
      position="static"
      color="inherit"
      elevation={0}
      sx={{
        width: '100%',
        flexShrink: 0,
        border: 'none',
        borderBottom: 1,
        borderColor: 'divider',
        borderRadius: 0,
        bgcolor: (theme) => surfaceMuted(theme),
        zIndex: (theme) => theme.zIndex.appBar,
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          minHeight: layoutTokens.headerHeight,
          px: { xs: 1, md: 2 },
          gap: { xs: 1, md: 1.5 },
          display: { xs: 'flex', lg: 'grid' },
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ flexShrink: 0, justifySelf: 'start', pr: { md: 1 } }}
        >
          <IconButton
            onClick={onMobileMenuClick}
            aria-label="Open navigation menu"
            size="small"
            sx={(theme) => ({
              display: 'inline-flex',
              ml: 0.5,
              [theme.breakpoints.up('lg')]: { display: 'none' },
            })}
          >
            <MenuIcon fontSize="small" />
          </IconButton>
          <Box
            component="img"
            src="/assets/majesco-logo.png"
            alt="Majesco"
            sx={{ width: 28, height: 28, objectFit: 'contain' }}
          />
          <Select
            value="pc-policy"
            variant="standard"
            disableUnderline
            IconComponent={KeyboardArrowDownIcon}
            sx={{
              fontWeight: 600,
              fontSize: '0.9375rem',
              display: { xs: 'none', sm: 'flex' },
              '& .MuiSelect-select': { py: 0.5, pr: '28px !important' },
            }}
          >
            <MenuItem value="pc-policy">P&amp;C Policy</MenuItem>
            <MenuItem value="claims">Claims</MenuItem>
            <MenuItem value="billing">Billing</MenuItem>
          </Select>
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          sx={{
            display: { xs: 'none', lg: 'flex' },
            justifyContent: 'center',
            gap: 0.75,
            width: 'min(720px, 56vw)',
            maxWidth: '100%',
            minWidth: 0,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.25}
            sx={{ flexShrink: 0 }}
          >
            <IconButton
              size="small"
              aria-label="Go back"
              disabled={!canGoBack}
              onClick={goBack}
              sx={historyNavButtonSx}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              aria-label="Go forward"
              disabled={!canGoForward}
              onClick={goForward}
              sx={historyNavButtonSx}
            >
              <ArrowForwardIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <GlobalSearchField fullWidth />
          </Box>

          <IconButton
            size="small"
            aria-label="Create new"
            aria-haspopup="true"
            aria-expanded={Boolean(createMenuAnchor)}
            onClick={(event) => setCreateMenuAnchor(event.currentTarget)}
            sx={{ flexShrink: 0 }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          spacing={0.25}
          sx={{
            flexShrink: 0,
            ml: { xs: 'auto', lg: 0 },
            justifySelf: 'end',
            justifyContent: 'flex-end',
          }}
        >
          <IconButton
            size="small"
            aria-label="Open search"
            onClick={() => setMobileSearchOpen((open) => !open)}
            sx={{ display: { xs: 'inline-flex', lg: 'none' } }}
          >
            <SearchIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            aria-label="Create new"
            aria-haspopup="true"
            aria-expanded={Boolean(createMenuAnchor)}
            onClick={(event) => setCreateMenuAnchor(event.currentTarget)}
            sx={{ display: { xs: 'inline-flex', lg: 'none' } }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
          <Menu
            anchorEl={createMenuAnchor}
            open={Boolean(createMenuAnchor)}
            onClose={handleCreateMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{
              paper: {
                sx: {
                  minWidth: 160,
                  mt: 0.75,
                },
              },
            }}
          >
            {CREATE_MENU_ITEMS.map((item) => (
              <MenuItem
                key={item.label}
                disabled={item.disabled}
                onClick={() => handleCreateMenuSelect(item.path)}
              >
                {item.label}
              </MenuItem>
            ))}
          </Menu>
          <IconButton color="inherit" aria-label="Settings" sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
            <SettingsOutlinedIcon fontSize="small" />
          </IconButton>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              fontSize: '0.8125rem',
              fontWeight: 600,
              bgcolor: (theme) => theme.figmaPalette.teal[600],
              ml: 0.5,
            }}
          >
            {userInitials}
          </Avatar>
        </Stack>
      </Toolbar>

      <Collapse in={mobileSearchOpen} sx={{ display: { xs: 'block', lg: 'none' } }}>
        <Box sx={{ px: 1.5, pb: 1.5, bgcolor: (theme) => surfaceMuted(theme) }}>
          <GlobalSearchField fullWidth autoFocus={mobileSearchOpen} />
        </Box>
      </Collapse>
    </AppBar>
  )
}
