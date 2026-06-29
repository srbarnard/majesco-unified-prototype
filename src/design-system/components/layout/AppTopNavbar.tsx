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
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router'
import { SearchField } from '@/design-system/components'
import { layoutTokens } from '@/design-system/tokens/layout'

type AppTopNavbarProps = {
  userInitials?: string
  onMobileMenuClick?: () => void
}

export function AppTopNavbar({ userInitials = 'CR', onMobileMenuClick }: AppTopNavbarProps) {
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  const routeSearchValue = useMemo(() => {
    const policyMatch = location.pathname.match(/\/policies\/([^/]+)/)
    return policyMatch?.[1] ?? ''
  }, [location.pathname])

  useEffect(() => {
    setSearchQuery(routeSearchValue)
  }, [routeSearchValue])

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
        bgcolor: (theme) => theme.figmaPalette.grey[50],
        zIndex: (theme) => theme.zIndex.appBar,
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          minHeight: layoutTokens.headerHeight,
          px: { xs: 1, md: 2 },
          gap: { xs: 1, md: 1.5 },
        }}
      >
        {/* Brand */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ flexShrink: 0, pr: { md: 1 } }}
        >
          <IconButton
            onClick={onMobileMenuClick}
            aria-label="Open navigation"
            size="small"
            sx={{ display: { xs: 'inline-flex', md: 'none' }, ml: 0.5 }}
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

        {/* Navigation arrows + search (desktop) */}
        <Stack
          direction="row"
          alignItems="center"
          sx={{
            flex: 1,
            minWidth: 0,
            display: { xs: 'none', md: 'flex' },
            gap: 1,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={0.25}
            sx={{ flexShrink: 0, width: 72 }}
          >
            <IconButton size="small" aria-label="Go back">
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" aria-label="Go forward">
              <ArrowForwardIcon fontSize="small" />
            </IconButton>
          </Stack>

          <SearchField
            fullWidth
            placeholder="Search P&amp;C Policy"
            value={searchQuery}
            onSearchChange={setSearchQuery}
            enableVoice
            sx={{ flex: 1, minWidth: 0, maxWidth: 'none' }}
          />
        </Stack>

        {/* Right actions */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.25}
          sx={{ flexShrink: 0, ml: { xs: 'auto', md: 0 } }}
        >
          <IconButton
            size="small"
            aria-label="Open search"
            onClick={() => setMobileSearchOpen((open) => !open)}
            sx={{ display: { xs: 'inline-flex', md: 'none' } }}
          >
            <SearchIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" aria-label="Create new">
            <AddIcon fontSize="small" />
          </IconButton>
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

      <Collapse in={mobileSearchOpen} sx={{ display: { xs: 'block', md: 'none' } }}>
        <Box sx={{ px: 1.5, pb: 1.5, bgcolor: (theme) => theme.figmaPalette.grey[50] }}>
          <SearchField
            fullWidth
            placeholder="Search P&amp;C Policy"
            value={searchQuery}
            onSearchChange={setSearchQuery}
            enableVoice
            autoFocus={mobileSearchOpen}
          />
        </Box>
      </Collapse>
    </AppBar>
  )
}
