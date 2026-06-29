import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import StarIcon from '@mui/icons-material/Star'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'
import { CopilotIcon, EmergencyHomeIcon } from '@/design-system/components'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { PolicyTabs, type PolicyTab } from './PolicyTabs'

export type RightPanel = 'parties' | 'copilot'

type PolicyHeaderProps = {
  companyName: string
  policyNumber: string
  activeTab: PolicyTab
  onTabChange: (tab: PolicyTab) => void
  activeRightPanel: RightPanel | null
  onToggleRightPanel: (panel: RightPanel) => void
  starred?: boolean
  onToggleStar?: () => void
  emergency?: boolean
  onToggleEmergency?: () => void
}

function PanelToggleButton({
  label,
  icon,
  active,
  onClick,
  hideLabelOnMobile = false,
}: {
  label: string
  icon: ReactNode
  active: boolean
  onClick: () => void
  hideLabelOnMobile?: boolean
}) {
  return (
    <Button
      size="small"
      variant="text"
      disableRipple
      startIcon={icon}
      onClick={onClick}
      sx={{
        textTransform: 'none',
        fontWeight: 400,
        fontSize: '0.8125rem',
        fontFamily: figmaFontFamilyStack.body,
        minWidth: 'auto',
        px: { xs: 1, sm: 1.25 },
        py: 0.75,
        border: 'none',
        borderRadius: '30px',
        boxShadow: 'none',
        color: active ? 'primary.main' : 'text.secondary',
        bgcolor: active ? (theme) => theme.figmaPalette.blue[50] : 'transparent',
        '&:hover': {
          bgcolor: active
            ? (theme) => theme.figmaPalette.blue[100]
            : (theme) => theme.figmaPalette.grey[100],
          boxShadow: 'none',
        },
        '& .MuiButton-startIcon': {
          marginRight: { xs: 0, sm: 0.75 },
          overflow: 'visible',
          color: 'inherit',
        },
        '& .panel-toggle-label': {
          display: hideLabelOnMobile ? { xs: 'none', sm: 'inline' } : 'inline',
        },
      }}
    >
      <span className="panel-toggle-label">{label}</span>
    </Button>
  )
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
  activeRightPanel,
  onToggleRightPanel,
  starred = false,
  onToggleStar,
  emergency = false,
  onToggleEmergency,
}: PolicyHeaderProps) {
  const contentPx = `${layoutTokens.contentPaddingX}px`

  return (
    <Box sx={{ bgcolor: 'background.paper', width: '100%' }}>
      <Box sx={{ px: contentPx, pt: layoutTokens.policyHeaderTopPadding, pb: 0.75 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <Typography
            variant="subtitle2"
            component="h1"
            sx={{
              fontFamily: figmaFontFamilyStack.heading,
              fontWeight: 600,
              lineHeight: 1.35,
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
            lineHeight: 1.35,
            fontSize: { xs: '0.875rem', md: '0.9375rem' },
            color: 'text.secondary',
            mt: 0.5,
          }}
          noWrap
        >
          Policy: #{policyNumber}
        </Typography>
      </Box>

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
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexShrink: 0 }}>
          <PanelToggleButton
            label="Parties"
            icon={<GroupsOutlinedIcon sx={{ fontSize: 18 }} />}
            active={activeRightPanel === 'parties'}
            onClick={() => onToggleRightPanel('parties')}
            hideLabelOnMobile
          />
          <PanelToggleButton
            label="Copilot"
            icon={<CopilotIcon size={18} active={activeRightPanel === 'copilot'} />}
            active={activeRightPanel === 'copilot'}
            onClick={() => onToggleRightPanel('copilot')}
          />
        </Stack>
      </Stack>
    </Box>
  )
}
