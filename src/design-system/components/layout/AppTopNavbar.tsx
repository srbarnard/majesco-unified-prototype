import MenuIcon from '@mui/icons-material/Menu'
import AddIcon from '@mui/icons-material/Add'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import SearchIcon from '@mui/icons-material/Search'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import AppBar from '@mui/material/AppBar'
import Avatar from '@mui/material/Avatar'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { type Theme } from '@mui/material/styles'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useRightToolDispatch, type RightToolId } from '@/app/contexts/RightToolContext'
import { GlobalSearchField } from '@/design-system/components/GlobalSearch/GlobalSearchField'
import { useBrowserHistoryNavigation } from '@/hooks/useBrowserHistoryNavigation'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
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
  tool?: RightToolId
}

const CREATE_MENU_ITEMS: CreateMenuItem[] = [
  { label: 'Customer', disabled: true },
  { label: 'Submission', disabled: false, tool: 'newSubmission' },
  { label: 'Quote', disabled: false, tool: 'newQuote' },
  { label: 'Policy', disabled: true },
  { label: 'Claim', disabled: false, tool: 'newClaim' },
]

/** Prototype unread count for account avatar + Notifications menu badge. */
const UNREAD_NOTIFICATION_COUNT = 3

const SETTINGS_MENU_ITEMS = [
  'Environments',
  'Users',
  'Groups',
  'User settings',
  'Application settings',
  'Audit trail',
] as const

const accountMenuItemSx = {
  fontFamily: figmaFontFamilyStack.body,
  fontSize: '0.875rem',
  fontWeight: 400,
  py: 1,
  px: 2,
  minHeight: 36,
} as const

const accountMenuIconSx = {
  display: 'inline-flex',
  alignItems: 'center',
  color: 'text.secondary',
  mr: 1,
  '& .MuiSvgIcon-root': { fontSize: 18 },
} as const

const navMenuPaperSx = {
  minWidth: 220,
  mt: 0.75,
  py: 0.5,
  border: 1,
  borderColor: 'divider',
  boxShadow: (theme: Theme) =>
    theme.palette.mode === 'dark' ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.12)',
} as const

export function AppTopNavbar({ userInitials = 'CR', onMobileMenuClick }: AppTopNavbarProps) {
  const navigate = useNavigate()
  const { openTool } = useRightToolDispatch()
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [createMenuAnchor, setCreateMenuAnchor] = useState<null | HTMLElement>(null)
  const [settingsMenuAnchor, setSettingsMenuAnchor] = useState<null | HTMLElement>(null)
  const [accountMenuAnchor, setAccountMenuAnchor] = useState<null | HTMLElement>(null)
  const { canGoBack, canGoForward, goBack, goForward } = useBrowserHistoryNavigation()

  const handleCreateMenuClose = () => setCreateMenuAnchor(null)

  const handleCreateMenuSelect = (item: CreateMenuItem) => {
    handleCreateMenuClose()
    if (item.tool) openTool(item.tool)
    else if (item.path) navigate(item.path)
  }

  const handleSettingsMenuClose = () => setSettingsMenuAnchor(null)

  const handleAccountMenuClose = () => setAccountMenuAnchor(null)

  const handleAccountMenuAction = (path?: string) => {
    handleAccountMenuClose()
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
            src="/assets/latent-needs-logo.svg"
            alt="Latent Needs"
            sx={(theme) => ({
              width: 28,
              height: 28,
              objectFit: 'contain',
              ...theme.applyStyles('dark', { filter: 'invert(1)' }),
            })}
          />
          <Typography
            component="span"
            sx={{
              fontWeight: 600,
              fontSize: '0.9375rem',
              display: { xs: 'none', sm: 'block' },
              py: 0.5,
              userSelect: 'none',
            }}
          >
            P&amp;C Policy
          </Typography>
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
                onClick={() => handleCreateMenuSelect(item)}
              >
                {item.label}
              </MenuItem>
            ))}
          </Menu>
          <IconButton
            color="inherit"
            aria-label="System administration"
            aria-haspopup="true"
            aria-expanded={Boolean(settingsMenuAnchor)}
            onClick={(event) => setSettingsMenuAnchor(event.currentTarget)}
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          >
            <SettingsOutlinedIcon fontSize="small" />
          </IconButton>
          <Menu
            anchorEl={settingsMenuAnchor}
            open={Boolean(settingsMenuAnchor)}
            onClose={handleSettingsMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{
              paper: { sx: navMenuPaperSx },
            }}
          >
            <Typography
              variant="caption"
              component="div"
              sx={{
                px: 2,
                pt: 1,
                pb: 0.75,
                fontFamily: figmaFontFamilyStack.body,
                fontWeight: 600,
                fontSize: '0.8125rem',
                color: 'text.secondary',
              }}
            >
              System Administration
            </Typography>
            {SETTINGS_MENU_ITEMS.map((label) => (
              <MenuItem
                key={label}
                onClick={handleSettingsMenuClose}
                sx={accountMenuItemSx}
              >
                {label}
              </MenuItem>
            ))}
          </Menu>
          <IconButton
            size="small"
            aria-label={
              UNREAD_NOTIFICATION_COUNT > 0
                ? `Account menu, ${UNREAD_NOTIFICATION_COUNT} unread notifications`
                : 'Account menu'
            }
            aria-haspopup="true"
            aria-expanded={Boolean(accountMenuAnchor)}
            onClick={(event) => setAccountMenuAnchor(event.currentTarget)}
            sx={{
              p: 0.25,
              ml: 0.5,
              bgcolor: 'transparent',
              '&:hover': { bgcolor: 'transparent' },
              '@media (hover: hover)': {
                '&:hover .MuiAvatar-root': {
                  bgcolor: (theme) => theme.figmaPalette.teal[700],
                },
              },
            }}
          >
            <Badge
              variant="dot"
              color="error"
              overlap="circular"
              invisible={UNREAD_NOTIFICATION_COUNT <= 0}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              sx={{
                '& .MuiBadge-badge': {
                  width: 12,
                  height: 12,
                  minWidth: 12,
                  borderRadius: '50%',
                  top: 0,
                  right: 0,
                  transform: 'translate(15%, -15%)',
                  border: 'none',
                  boxSizing: 'border-box',
                  zIndex: 1,
                },
              }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  bgcolor: (theme) => theme.figmaPalette.teal[600],
                  transition: 'background-color 0.15s ease',
                }}
              >
                {userInitials}
              </Avatar>
            </Badge>
          </IconButton>
          <Menu
            anchorEl={accountMenuAnchor}
            open={Boolean(accountMenuAnchor)}
            onClose={handleAccountMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{
              paper: { sx: navMenuPaperSx },
            }}
          >
            <MenuItem onClick={() => handleAccountMenuAction()} sx={accountMenuItemSx}>
              My Account
            </MenuItem>
            <MenuItem
              onClick={() => handleAccountMenuAction()}
              sx={{
                ...accountMenuItemSx,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: 1,
              }}
            >
              Notifications
              {UNREAD_NOTIFICATION_COUNT > 0 ? (
                <Box
                  component="span"
                  aria-label={`${UNREAD_NOTIFICATION_COUNT} unread`}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 18,
                    height: 18,
                    px: 0.5,
                    borderRadius: '9px',
                    bgcolor: 'error.main',
                    color: 'error.contrastText',
                    fontFamily: figmaFontFamilyStack.body,
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    lineHeight: 1,
                  }}
                >
                  {UNREAD_NOTIFICATION_COUNT}
                </Box>
              ) : null}
            </MenuItem>
            <MenuItem onClick={() => handleAccountMenuAction('/settings')} sx={accountMenuItemSx}>
              Settings...
            </MenuItem>

            <Divider sx={{ my: 0.75 }} />

            <MenuItem onClick={() => handleAccountMenuAction()} sx={accountMenuItemSx}>
              Legal
            </MenuItem>
            <MenuItem onClick={() => handleAccountMenuAction()} sx={accountMenuItemSx}>
              Privacy
            </MenuItem>
            <MenuItem onClick={() => handleAccountMenuAction()} sx={accountMenuItemSx}>
              Cookie Policy
            </MenuItem>

            <Divider sx={{ my: 0.75 }} />

            <MenuItem onClick={() => handleAccountMenuAction()} sx={accountMenuItemSx}>
              <Box component="span" sx={accountMenuIconSx}>
                <HelpOutlineOutlinedIcon />
              </Box>
              Contact Support...
            </MenuItem>
            <MenuItem onClick={() => handleAccountMenuAction()} sx={accountMenuItemSx}>
              <Box component="span" sx={accountMenuIconSx}>
                <LogoutOutlinedIcon />
              </Box>
              Sign Out
            </MenuItem>

            <Divider sx={{ my: 0.75 }} />

            <Box sx={{ px: 2, py: 1 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ fontFamily: figmaFontFamilyStack.body, lineHeight: 1.45 }}
              >
                <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  Release:
                </Box>{' '}
                Fall &apos;26 Update 5
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ fontFamily: figmaFontFamilyStack.body, lineHeight: 1.45 }}
              >
                (Build 2026.02.00)
              </Typography>
            </Box>
          </Menu>
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
