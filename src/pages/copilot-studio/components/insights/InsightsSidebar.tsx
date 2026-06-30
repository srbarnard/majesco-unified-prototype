import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import type { StudioInsightsView } from '@/pages/copilot-studio/data/studioInsightsData'
import { accentSubtle, accentSubtleHover, surfacePanel, surfaceSubtle } from '@/design-system/theme/themeSurfaces'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'

type InsightsSidebarProps = {
  activeView: StudioInsightsView
  onViewChange: (view: StudioInsightsView) => void
}

function NavItem({
  label,
  active,
  onClick,
  indent = false,
  badge,
}: {
  label: string
  active: boolean
  onClick: () => void
  indent?: boolean
  badge?: string
}) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        width: '100%',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
        pl: indent ? 3 : 1.5,
        pr: 1.5,
        py: 1,
        borderRadius: 1.5,
        bgcolor: active ? (theme) => accentSubtle(theme) : 'transparent',
        color: active ? 'primary.main' : 'text.primary',
        fontFamily: figmaFontFamilyStack.body,
        fontSize: '0.875rem',
        fontWeight: active ? 600 : 400,
        '&:hover': {
          bgcolor: (theme) => (active ? accentSubtleHover(theme) : surfaceSubtle(theme)),
        },
      }}
    >
      <span>{label}</span>
      {badge && (
        <Chip
          label={badge}
          size="small"
          sx={(theme) => ({
            height: 20,
            fontSize: '0.625rem',
            fontWeight: 600,
            bgcolor: surfaceSubtle(theme),
            color: 'text.secondary',
            border: 'none',
            '& .MuiChip-label': { px: 0.75 },
          })}
        />
      )}
    </Box>
  )
}

export function InsightsSidebar({ activeView, onViewChange }: InsightsSidebarProps) {
  const [triggersOpen, setTriggersOpen] = useState(true)

  return (
    <Box
      sx={{
        width: layoutTokens.secondaryPanelWidth,
        flexShrink: 0,
        height: '100%',
        borderRight: 1,
        borderColor: 'divider',
        bgcolor: (theme) => surfacePanel(theme),
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1.5, flexShrink: 0 }}>
        <Typography variant="subtitle1" sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600 }}>
          Insights
        </Typography>
      </Stack>

      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 1, pb: 2 }}>
        <Stack spacing={0.25}>
          <NavItem label="Overview" active={activeView === 'overview'} onClick={() => onViewChange('overview')} />
          <NavItem label="Assistants" active={activeView === 'assistants'} onClick={() => onViewChange('assistants')} />
          <NavItem label="Agents" active={activeView === 'agents'} onClick={() => onViewChange('agents')} />

          <Box
            component="button"
            type="button"
            onClick={() => setTriggersOpen((open) => !open)}
            sx={{
              width: '100%',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              pl: 1.5,
              pr: 1.5,
              py: 1,
              borderRadius: 1.5,
              bgcolor: 'transparent',
              color: 'text.primary',
              fontFamily: figmaFontFamilyStack.body,
              fontSize: '0.875rem',
              fontWeight: 400,
              '&:hover': { bgcolor: (theme) => surfaceSubtle(theme) },
            }}
          >
            {triggersOpen ? <ExpandMoreIcon sx={{ fontSize: 18 }} /> : <ChevronRightIcon sx={{ fontSize: 18 }} />}
            Triggers
          </Box>

          <Collapse in={triggersOpen}>
            <NavItem label="Email" active={activeView === 'email'} onClick={() => onViewChange('email')} indent />
          </Collapse>

          <NavItem
            label="MCP Servers"
            active={activeView === 'mcp'}
            onClick={() => onViewChange('mcp')}
            badge="BETA"
          />
        </Stack>
      </Box>
    </Box>
  )
}
