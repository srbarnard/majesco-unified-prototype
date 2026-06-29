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
import { CopilotIcon } from '@/design-system/components'
import { getPanelToggleButtonStyles, sectionTabRowBorderSx } from '@/design-system/theme/themeSurfaces'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { QuoteStatusChip } from '@/pages/quotes/components/QuoteStatusChip'
import type { QuoteDetailsRecord } from '@/pages/quotes/data/mockQuoteDetails'
import { QuoteTabs, type QuoteTab } from '@/pages/quotes/components/QuoteTabs'

export type QuoteRightPanel = 'parties' | 'copilot'

type QuoteHeaderProps = {
  quote: QuoteDetailsRecord
  activeTab: QuoteTab
  onTabChange: (tab: QuoteTab) => void
  activeRightPanel: QuoteRightPanel | null
  onToggleRightPanel: (panel: QuoteRightPanel) => void
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

export function QuoteHeader({
  quote,
  activeTab,
  onTabChange,
  activeRightPanel,
  onToggleRightPanel,
  starred = false,
  onToggleStar,
}: QuoteHeaderProps) {
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
            {quote.insuredName}
          </Typography>

          <Stack direction="row" spacing={0.25} alignItems="center" sx={{ flexShrink: 0 }}>
            <Tooltip title="Copy quote number">
              <IconButton size="small" aria-label="Copy quote number" sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
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
            <Tooltip title="Edit quote">
              <IconButton size="small" aria-label="Edit quote" sx={{ display: { xs: 'none', md: 'inline-flex' } }}>
                <EditOutlinedIcon sx={{ fontSize: 18 }} />
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
            Quote #{quote.quoteNumber}
          </Typography>
          <QuoteStatusChip status={quote.status} />
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
            <QuoteTabs value={activeTab} onChange={onTabChange} />
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
    </Box>
  )
}
