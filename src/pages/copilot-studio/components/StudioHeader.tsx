import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined'
import MuiButton from '@mui/material/Button'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'
import { StudioTabs } from '@/pages/copilot-studio/components/StudioTabs'
import type { StudioTab } from '@/pages/copilot-studio/data/mockCopilotStudio'
import { getPanelToggleButtonStyles, sectionTabRowBorderSx } from '@/design-system/theme/themeSurfaces'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'

type StudioHeaderProps = {
  activeTab: StudioTab
  onTabChange: (tab: StudioTab) => void
  chatDrawerOpen: boolean
  onToggleChatDrawer: () => void
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
    <MuiButton
      size="small"
      variant="text"
      disableRipple
      startIcon={icon}
      onClick={onClick}
      sx={(theme) => ({
        ...getPanelToggleButtonStyles(theme, active),
        fontFamily: figmaFontFamilyStack.body,
        '& .MuiButton-startIcon': {
          marginRight: { xs: 0, sm: 0.75 },
          overflow: 'visible',
          color: 'inherit',
        },
        '& .panel-toggle-label': {
          display: hideLabelOnMobile ? { xs: 'none', sm: 'inline' } : 'inline',
        },
      })}
    >
      <span className="panel-toggle-label">{label}</span>
    </MuiButton>
  )
}

export function StudioHeader({ activeTab, onTabChange, chatDrawerOpen, onToggleChatDrawer }: StudioHeaderProps) {
  const contentPx = `${layoutTokens.contentPaddingX}px`

  return (
    <Box sx={{ bgcolor: 'background.paper', width: '100%', flexShrink: 0 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: contentPx, pt: layoutTokens.policyHeaderTopPadding, pb: 1.5 }}
      >
        <Typography
          variant="h5"
          component="h1"
          sx={{
            fontFamily: figmaFontFamilyStack.heading,
            fontWeight: 600,
            fontSize: { xs: '1.25rem', md: '1.375rem' },
            lineHeight: 1.3,
          }}
        >
          Copilot Studio
        </Typography>
      </Stack>

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
            <StudioTabs value={activeTab} onChange={onTabChange} />
          </Box>
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexShrink: 0 }}>
            <PanelToggleButton
              label="History"
              icon={<HistoryOutlinedIcon sx={{ fontSize: 18 }} />}
              active={chatDrawerOpen}
              onClick={onToggleChatDrawer}
              hideLabelOnMobile
            />
          </Stack>
        </Stack>
      </Box>
    </Box>
  )
}
