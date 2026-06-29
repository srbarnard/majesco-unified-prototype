import AddIcon from '@mui/icons-material/Add'
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined'
import MuiButton from '@mui/material/Button'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'
import { Button, CopilotIcon } from '@/design-system/components'
import { getPanelToggleButtonStyles } from '@/design-system/theme/themeSurfaces'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { TasksTabs, type TasksTab } from './TasksTabs'

type TasksHeaderProps = {
  activeTab: TasksTab
  onTabChange: (tab: TasksTab) => void
  filterOpen: boolean
  onToggleFilter: () => void
  copilotOpen: boolean
  onToggleCopilot: () => void
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

export function TasksHeader({
  activeTab,
  onTabChange,
  filterOpen,
  onToggleFilter,
  copilotOpen,
  onToggleCopilot,
}: TasksHeaderProps) {
  const contentPx = `${layoutTokens.contentPaddingX}px`
  const showPanels = activeTab === 'all' || activeTab === 'team'

  return (
    <Box sx={{ bgcolor: 'background.paper', width: '100%', flexShrink: 0 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        spacing={1.5}
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
          Tasks
        </Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} sx={{ flexShrink: 0 }}>
          Add task
        </Button>
      </Stack>

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
          <TasksTabs value={activeTab} onChange={onTabChange} />
        </Box>
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexShrink: 0 }}>
          {showPanels && (
            <>
              <PanelToggleButton
                label="Filter"
                icon={<FilterListOutlinedIcon sx={{ fontSize: 18 }} />}
                active={filterOpen}
                onClick={onToggleFilter}
                hideLabelOnMobile
              />
              <PanelToggleButton
                label="Copilot"
                icon={<CopilotIcon size={18} active={copilotOpen} />}
                active={copilotOpen}
                onClick={onToggleCopilot}
              />
            </>
          )}
        </Stack>
      </Stack>
    </Box>
  )
}
