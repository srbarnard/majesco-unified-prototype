import AddIcon from '@mui/icons-material/Add'
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined'
import StickyNote2OutlinedIcon from '@mui/icons-material/StickyNote2Outlined'
import MuiButton from '@mui/material/Button'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'
import { Button, CopilotIcon } from '@/design-system/components'
import { getPanelToggleButtonStyles, sectionTabRowBorderSx } from '@/design-system/theme/themeSurfaces'
import { listPageCreateButtonSx } from '@/design-system/tokens/listPageHeader'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { SubmissionsTabs, type SubmissionsTab } from './SubmissionsTabs'

type SubmissionsHeaderProps = {
  activeTab: SubmissionsTab
  onTabChange: (tab: SubmissionsTab) => void
  filterOpen: boolean
  onToggleFilter: () => void
  notesOpen: boolean
  onToggleNotes: () => void
  copilotOpen: boolean
  onToggleCopilot: () => void
  onCreateSubmission?: () => void
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

export function SubmissionsHeader({
  activeTab,
  onTabChange,
  filterOpen,
  onToggleFilter,
  notesOpen,
  onToggleNotes,
  copilotOpen,
  onToggleCopilot,
  onCreateSubmission,
}: SubmissionsHeaderProps) {
  const contentPx = `${layoutTokens.contentPaddingX}px`

  return (
    <Box sx={{ bgcolor: 'background.paper', width: '100%', flexShrink: 0 }}>
      <Stack
        direction="row"
        alignItems="center"
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
            minWidth: 0,
          }}
        >
          Submissions
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          aria-label="Create submission"
          sx={listPageCreateButtonSx}
          onClick={onCreateSubmission}
        >
          <span className="create-btn-label">Create submission</span>
        </Button>
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
            <SubmissionsTabs value={activeTab} onChange={onTabChange} />
          </Box>
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexShrink: 0 }}>
            {activeTab === 'all' && (
              <>
                <PanelToggleButton
                  label="Filter"
                  icon={<FilterListOutlinedIcon sx={{ fontSize: 18 }} />}
                  active={filterOpen}
                  onClick={onToggleFilter}
                  hideLabelOnMobile
                />
                <PanelToggleButton
                  label="Notes"
                  icon={<StickyNote2OutlinedIcon sx={{ fontSize: 18 }} />}
                  active={notesOpen}
                  onClick={onToggleNotes}
                  hideLabelOnMobile
                />
                <PanelToggleButton
                  label="Copilot"
                  icon={<CopilotIcon size={18} active={copilotOpen} />}
                  active={copilotOpen}
                  onClick={onToggleCopilot}
                  hideLabelOnMobile
                />
              </>
            )}
          </Stack>
        </Stack>
      </Box>
    </Box>
  )
}
