import MuiButton from '@mui/material/Button'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import { CopilotIcon } from '@/design-system/components'
import { getPanelToggleButtonStyles } from '@/design-system/theme/themeSurfaces'
import { useGlobalSearch } from '@/app/contexts/GlobalSearchContext'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { AgenticActivityFeed } from '@/app/pages/home/AgenticActivityFeed'
import { PriorityTasksCarousel } from '@/app/pages/home/PriorityTasksCarousel'
import { CopilotPanel } from '@/pages/policies/components/CopilotPanel'
import { ResizableRightPanel } from '@/pages/policies/components/ResizableRightPanel'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function PanelToggleButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string
  icon: ReactNode
  active: boolean
  onClick: () => void
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
      })}
    >
      {label}
    </MuiButton>
  )
}

export function DashboardPage() {
  const { copilotOpen, copilotView, agenticPrompt, toggleCopilot, closeCopilot, openHomeCopilotDefault } =
    useGlobalSearch()
  const contentPx = `${layoutTokens.contentPaddingX}px`

  const didInitCopilot = useRef(false)

  useEffect(() => {
    if (didInitCopilot.current) return
    didInitCopilot.current = true
    if (agenticPrompt || copilotView === 'agentic-search') return
    openHomeCopilotDefault()
  }, [agenticPrompt, copilotView, openHomeCopilotDefault])

  return (
    <Box
      sx={{
        display: 'flex',
        flex: 1,
        minHeight: 0,
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        <Box
          sx={{
            flexShrink: 0,
            px: contentPx,
            pt: layoutTokens.policyHeaderTopPadding,
            pb: 1.5,
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
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
              {getGreeting()}, Chris
            </Typography>
            <PanelToggleButton
              label="Copilot"
              icon={<CopilotIcon size={18} active={copilotOpen} />}
              active={copilotOpen}
              onClick={toggleCopilot}
            />
          </Stack>
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
            px: contentPx,
            pb: contentPx,
            width: '100%',
          }}
        >
          <Stack spacing={3.5} sx={{ width: '100%' }}>
            <PriorityTasksCarousel />
            <AgenticActivityFeed />
          </Stack>
        </Box>
      </Box>

      <ResizableRightPanel open={copilotOpen}>
        <CopilotPanel
          context="global"
          globalView={copilotView}
          agenticPrompt={agenticPrompt}
          onClose={closeCopilot}
        />
      </ResizableRightPanel>
    </Box>
  )
}
