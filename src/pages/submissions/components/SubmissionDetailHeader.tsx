import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import MoveToInboxOutlinedIcon from '@mui/icons-material/MoveToInboxOutlined'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import StarIcon from '@mui/icons-material/Star'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'
import { CopilotIcon, EntityListHomeButton } from '@/design-system/components'
import { getPanelToggleButtonStyles, sectionTabRowBorderSx } from '@/design-system/theme/themeSurfaces'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { SubmissionStatusChip } from '@/pages/submissions/components/SubmissionStatusChip'
import {
  SubmissionDetailTabs,
  type SubmissionDetailTab,
} from '@/pages/submissions/components/SubmissionDetailTabs'
import type { SubmissionDetailsRecord } from '@/pages/submissions/data/resolveSubmissionContext'

export type SubmissionRightPanel = 'parties' | 'copilot'

type SubmissionDetailHeaderProps = {
  submission: SubmissionDetailsRecord
  activeTab: SubmissionDetailTab
  onTabChange: (tab: SubmissionDetailTab) => void
  activeRightPanel: SubmissionRightPanel | null
  onToggleRightPanel: (panel: SubmissionRightPanel) => void
  documentsFilterOpen?: boolean
  onToggleDocumentsFilter?: () => void
  onStatusClick?: () => void
  starred?: boolean
  onToggleStar?: () => void
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
    </Button>
  )
}

export function SubmissionDetailHeader({
  submission,
  activeTab,
  onTabChange,
  activeRightPanel,
  onToggleRightPanel,
  documentsFilterOpen = false,
  onToggleDocumentsFilter,
  onStatusClick,
  starred = false,
  onToggleStar,
}: SubmissionDetailHeaderProps) {
  const contentPx = `${layoutTokens.contentPaddingX}px`
  const isDocumentsTab = activeTab === 'documents'

  return (
    <Box sx={{ bgcolor: 'background.paper', width: '100%' }}>
      <Box sx={{ px: contentPx, pt: layoutTokens.policyHeaderTopPadding, pb: 0.75 }}>
        <Stack direction="row" spacing={1.25} alignItems="flex-start">
          <EntityListHomeButton
            to="/submissions"
            label="All submissions"
            icon={MoveToInboxOutlinedIcon}
          />
          <Box sx={{ minWidth: 0, flex: 1 }}>
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
                {submission.insuredName}
              </Typography>

              <Stack direction="row" spacing={0.25} alignItems="center" sx={{ flexShrink: 0 }}>
                <Tooltip title="Copy submission number">
                  <IconButton
                    size="small"
                    aria-label="Copy submission number"
                    sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                  >
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
                <Tooltip title="More actions">
                  <IconButton size="small" aria-label="More actions">
                    <MoreHorizIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.75, flexWrap: 'wrap', gap: 0.75 }}>
              <Typography
                variant="subtitle2"
                component="p"
                sx={{
                  fontFamily: figmaFontFamilyStack.heading,
                  fontWeight: 500,
                  lineHeight: 1.35,
                  fontSize: { xs: '0.875rem', md: '0.9375rem' },
                  color: 'text.secondary',
                }}
              >
                Submission #{submission.submissionNumber}
              </Typography>
              <SubmissionStatusChip
                status={submission.status}
                onClick={onStatusClick}
                selected={activeRightPanel === 'copilot'}
              />
            </Stack>
          </Box>
        </Stack>
      </Box>

      <Box sx={sectionTabRowBorderSx}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: contentPx, minHeight: 44, gap: 1 }}
        >
          <Box sx={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
            <SubmissionDetailTabs value={activeTab} onChange={onTabChange} />
          </Box>
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexShrink: 0 }}>
            {isDocumentsTab && (
              <PanelToggleButton
                label="Filter"
                icon={<FilterListOutlinedIcon sx={{ fontSize: 18 }} />}
                active={documentsFilterOpen}
                onClick={() => onToggleDocumentsFilter?.()}
                hideLabelOnMobile
              />
            )}
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
              hideLabelOnMobile
            />
          </Stack>
        </Stack>
      </Box>
    </Box>
  )
}
