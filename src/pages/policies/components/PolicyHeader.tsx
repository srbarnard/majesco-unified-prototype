import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import PolicyOutlinedIcon from '@mui/icons-material/PolicyOutlined'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import StarIcon from '@mui/icons-material/Star'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { EmergencyHomeIcon, EntityListHomeButton } from '@/design-system/components'
import { sectionTabRowBorderSx } from '@/design-system/theme/themeSurfaces'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { PolicyTabs, type PolicyTab } from './PolicyTabs'

type PolicyHeaderProps = {
  companyName: string
  policyNumber: string
  activeTab: PolicyTab
  onTabChange: (tab: PolicyTab) => void
  starred?: boolean
  onToggleStar?: () => void
  emergency?: boolean
  onToggleEmergency?: () => void
}

function PolicyHeaderActions({
  starred,
  onToggleStar,
  emergency = false,
  onToggleEmergency,
}: {
  starred?: boolean
  onToggleStar?: () => void
  emergency?: boolean
  onToggleEmergency?: () => void
}) {
  return (
    <Stack direction="row" spacing={0.25} alignItems="center" sx={{ flexShrink: 0 }}>
      <Tooltip title="Copy policy number">
        <IconButton size="small" aria-label="Copy policy number" sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
          <ContentCopyOutlinedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title={starred ? 'Remove from favorites' : 'Add to favorites'}>
        <IconButton size="small" onClick={onToggleStar} aria-label="Toggle favorite">
          {starred ? (
            <StarIcon sx={{ fontSize: 18, color: 'warning.main' }} />
          ) : (
            <StarBorderIcon sx={{ fontSize: 18 }} />
          )}
        </IconButton>
      </Tooltip>
      <Tooltip title={emergency ? 'Remove emergency flag' : 'Mark as emergency'}>
        <IconButton
          size="small"
          onClick={onToggleEmergency}
          aria-label="Toggle emergency"
          aria-pressed={emergency}
          sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
        >
          <EmergencyHomeIcon active={emergency} sx={{ fontSize: 20 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Edit policy">
        <IconButton size="small" aria-label="Edit policy" sx={{ display: { xs: 'none', md: 'inline-flex' } }}>
          <EditOutlinedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="More actions">
        <IconButton size="small" aria-label="More actions">
          <MoreHorizIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
    </Stack>
  )
}

export function PolicyHeader({
  companyName,
  policyNumber,
  activeTab,
  onTabChange,
  starred = false,
  onToggleStar,
  emergency = false,
  onToggleEmergency,
}: PolicyHeaderProps) {
  const contentPx = `${layoutTokens.contentPaddingX}px`

  return (
    <Box sx={{ bgcolor: 'background.paper', width: '100%' }}>
      <Box sx={{ px: contentPx, pt: layoutTokens.policyHeaderTopPadding, pb: 0.75 }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <EntityListHomeButton to="/policies" label="All policies" icon={PolicyOutlinedIcon} tone="policies" />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
              <Typography
                variant="subtitle2"
                component="h1"
                sx={{
                  fontFamily: figmaFontFamilyStack.heading,
                  fontWeight: 600,
                  lineHeight: 1.3,
                  fontSize: { xs: '1rem', md: '1.0625rem' },
                  color: 'text.primary',
                  minWidth: 0,
                  flex: 1,
                }}
                noWrap
              >
                {companyName}
              </Typography>

              <PolicyHeaderActions
                starred={starred}
                onToggleStar={onToggleStar}
                emergency={emergency}
                onToggleEmergency={onToggleEmergency}
              />
            </Stack>

            <Typography
              variant="subtitle2"
              component="p"
              sx={{
                fontFamily: figmaFontFamilyStack.heading,
                fontWeight: 500,
                lineHeight: 1.3,
                fontSize: { xs: '0.8125rem', md: '0.875rem' },
                color: 'text.secondary',
                mt: 0.125,
              }}
              noWrap
            >
              Policy: #{policyNumber}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={sectionTabRowBorderSx}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            px: contentPx,
            minHeight: 44,
            gap: 1,
          }}
        >
          <Box sx={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
            <PolicyTabs value={activeTab} onChange={onTabChange} />
          </Box>
        </Stack>
      </Box>
    </Box>
  )
}
